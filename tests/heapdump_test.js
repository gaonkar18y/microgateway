const heapdump = require('heapdump');
const cluster = require('cluster');

const heapdumpPath = process.env.EMG_HEAPDUMP_PATH;

module.exports.masterHeapDump = function(){

    setInterval(()=>{
        heapdump.writeSnapshot(heapdumpPath+'/master' + Date.now() + '.heapsnapshot');
    },120000);
    
}

module.exports.workerHeapDump = function(){

    setInterval(()=>{
        heapdump.writeSnapshot(heapdumpPath+'/worker_'+ cluster.worker.id+'_' + Date.now() + '.heapsnapshot');
    },120000);
    
}

