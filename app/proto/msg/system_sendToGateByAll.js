/**
 * Created by yangsong on 16/1/24.
 */

var ByteBuffer = require('../../../libs/proto/ByteBuffer.js');
var Msg = require('../../../libs/proto/Msg.js');



function system_sendToGateByAll(){
	this.msgId = 10005;
	this.msgBody = null;

}

system_sendToGateByAll.prototype.encode = function(){
    var buff = new ByteBuffer();
	Msg.encode(buff, 'ushort', this.msgId);
	Msg.encode(buff, 'buffer', this.msgBody);

    return buff.pack();
}

system_sendToGateByAll.prototype.decode = function(ba){
    var buff = new ByteBuffer(ba);
	this.msgId = Msg.decode(buff, 'ushort');
	this.msgBody = Msg.decode(buff, 'buffer');

}


module.exports = system_sendToGateByAll;