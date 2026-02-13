import { Dexie } from 'dexie';

const databaseName = 'titleQuestScore';

class DbService {
    /**
     * @type {Dexie | undefined}
     */
    #database = new Dexie(databaseName);

    async connect() {
        this.#database.version(1).stores({
            raw: '++id, game, date, processed'
        });

        this.#database.version(2).stores({
            raw: '++id, game, date, intScore'
        }).upgrade(tx => {
            tx.table('raw').toCollection().modify(rawScore => {
                if (rawScore.intScore === undefined) {
                    rawScore.intScore = -1;
                    delete rawScore.processed;
                }
            });
        });

        this.#database.version(3).stores({
            raw: '++id, game, [game+date], intScore'
        });

        await this.#database.open();
    }

    async saveScoreRaw(game, date, score) {
        await this.#database.raw.add({ game, date, score, intScore: -1 });
    }

    async getScoreRaw(game, date) {
        const entry = await this.#database.raw.where({ game, date }).first();
        return entry ? entry.score : null;
    }

    async getIncompleteScores() {
        return await this.#database.raw.where('intScore').equals(-1).toArray();
    }

    async updateScoreRaw(scoreEntry) {
        await this.#database.raw.put(scoreEntry);
    }

    /**
     * Get aggregated scores by round (intScore) for a specific game
     * @param {string} game game identifier
     * @returns {Promise<Record<string, number>>} A record mapping round numbers to counts
     */
    async getScoresForGame(game) {
        const scoresByDate = {};
        await this.#database.raw.where('game').equals(game).each(
            scoreEntry => {
                const date = scoreEntry.date;
                if (!scoresByDate[date] || scoreEntry.intScore < scoresByDate[date]) {
                    scoresByDate[date] = scoreEntry.intScore;
                }
            }
        );
        const gameScoresByRound = Object.values(scoresByDate).reduce((acc, curr) => {
            const round = String(curr);
            acc[round] = (acc[round] || 0) + 1;
            return acc;
        }, {});
        return gameScoresByRound;
    }

    /**
     * Get aggregated counts of unique games played by date
     * @returns {Promise<Record<string, number>>} A record mapping dates to counts of unique games
     */
    async countScoresByDate() {
        const gamesByDate = {};
        await this.#database.raw.each(scoreEntry => {
            const date = scoreEntry.date;
            if (!gamesByDate[date]) {
                // Use a Set to avoid counting duplicate games on the same date
                gamesByDate[date] = new Set();
            }
            gamesByDate[date].add(scoreEntry.game);
        });

        const countsByDate = Object.entries(gamesByDate).reduce((acc, [date, games]) => {
            acc[date] = games.size;
            return acc;
        }, {});
        return countsByDate;
    }

    /**
     * Get the underlying Dexie database instance
     * @returns {Dexie} The database instance
     */
    getDatabase() {
        return this.#database;
    }

    async drop() {
        await this.#database.delete();
    }
}

export const dbService = new DbService();