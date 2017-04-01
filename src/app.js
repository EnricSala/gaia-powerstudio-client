const cron = require('cron');

const config = require('./configuration.json');
const powerstudio = require('./powerstudio.js');
const repository = require('./repository.js');

const IDS_FILE = config.idsFile;
const OUTPUT_DIR = config.outputDir;

repository.loadIds(IDS_FILE)
    .then(ids => start(ids))
    .catch(err => console.error(err));

function start(ids) {
    new cron.CronJob({
        cronTime: '*/30 * * * * *',
        timeZone: 'UTC',
        onTick: buildTick(ids),
        start: true
    });
}

function buildTick(ids) {
    return () => {
        powerstudio.query(ids)
            .then(res => repository.exportSnapshot(res, OUTPUT_DIR))
            .catch(err => console.error(err));
    };
}
