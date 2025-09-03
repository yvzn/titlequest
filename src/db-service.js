import { Dexie } from 'dexie';

const databaseName = 'titleQuestScore';
const databaseVersion = 2;

class DbService {
    /**
     * @type {Dexie | undefined}
     */
    #database = new Dexie(databaseName);

    async connect() {
        this.#database.version(databaseVersion).stores({
            raw: '++id, game, date, intScore' // do not index 'score'
        }).upgrade(tx => {
            tx.table('raw').toCollection().modify(rawScore => {
                if (rawScore.intScore === undefined) {
                    rawScore.intScore = -1;
                    delete rawScore.processed;
                }
            });
        });
        await this.#database.open();
    }

    async saveScoreRaw(game, date, score) {
        await this.#database.raw.add({ game, date, score, intScore: -1 });
    }

    async getIncompleteScores() {
        return await this.#database.raw.where('intScore').equals(-1).toArray();
    }

    async updateScoreRaw(scoreEntry) {
        await this.#database.raw.put(scoreEntry);
    }

    async getScoresForGame(game) {
        const gameScoresByRound = await this.#database.raw.where('game').equals(game).toArray();
        return gameScoresByRound.reduce((acc, curr) => {
            const round = String(curr.intScore);
            acc[round] = (acc[round] || 0) + 1;
            return acc;
        }, {});
    }

    async drop() {
        await this.#database.delete();
    }
}

export const dbService = new DbService();