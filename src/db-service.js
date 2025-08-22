import { Dexie } from 'dexie';

const databaseName = 'titleQuestScore';
const databaseVersion = 1;

class DbService {
    /**
     * @type {Dexie | undefined}
     */
    #database = new Dexie(databaseName);

    async connect() {
        this.#database.version(databaseVersion).stores({
            raw: '++id, game, date, processed' // do not index 'score'
        });
        await this.#database.open();
    }

    async saveScore(game, date, score) {
        await this.#database.raw.add({ game, date, score, processed: false });
    }

    async drop() {
        await this.#database.delete();
    }
}

export const dbService = new DbService();