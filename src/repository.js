const jetpack = require('fs-jetpack');
const moment = require('moment');
const path = require('path');
const rx = require('rxjs/Rx');

const CONFIG_COMMENT = '#';
const TIME_FORMAT = 'YYYY-MM-DD_HH-mm-ss';
const EXPORT_EXTENSION = '.csv';

function loadIds(file) {
    return rx.Observable
        .fromPromise(jetpack.readAsync(file))
        .flatMap(str => str.split(/\r?\n/))
        .map(line => line.trim())
        .filter(line => line && !line.startsWith(CONFIG_COMMENT))
        .toArray()
        .toPromise();
}

function exportSnapshot(snapshot, dir) {
    const time = moment().utc().format(TIME_FORMAT);
    const filename = `${time}${EXPORT_EXTENSION}`;
    const savePath = path.join(dir, filename);

    const content = snapshot
        .map(point => `${point.id},${point.value}`)
        .join('\n') + '\n';

    console.log(`Writing snapshot as: ${filename}`);
    jetpack.write(savePath, content);
}

module.exports = { loadIds, exportSnapshot };
