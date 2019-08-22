// @ts-check
const NdrObject = require('../ndr/ndrobject');
const MarshalUnMarshalHelper = require('./marshalunmarshalhelper');
const ComValue = require('./comvalue');
const types = require('./types');
const Flags = require('./flags'); 

class PingObject extends NdrObject{
  constructor() {
    super();
    this.opnum = -1; 
    this.listOfAdds = new Array();
    this.listOfDels = new Array();
    this.setId = null;
    this.seqNum = 0;
  }

  /**
   * @retuns {Number}
   */
  getOpnum() {
    return this.opnum;
  }

  /**
   * 
   * @param {NetworkDataRepresentation} ndr 
   */
  write(ndr) {
    switch(this.opnum){
        case 1: 
            if (this.setId != null) {
                MarshalUnMarshalHelper.writeOctetArrayLE(ndr, Buffer.from(this.setId)) ;
            } else {
                console.log(new Error("Simple ping requested without a setID!"));
            }
            break;  
        case 2:
            let newLength = 8 + 6 + 8 + this.listOfAdds.length * 8 + 8 + this.listOfDels.length * 8 + 16;
            if (newLength > ndr.getBuffer().buf.length) {
                ndr.getBuffer().buf = new Array(newLength + 16);
            }

            if (this.setId == null) {
                this.setId = [0,0,0,0,0,0,0,0];
            } else {
                console.log(new Error("Complex Ping going for setId: " + this.setId));
            }

            MarshalUnMarshalHelper.writeOctetArrayLE(ndr, Buffer.from(this.setId));

            MarshalUnMarshalHelper.serialize(ndr, new ComValue(this.seqNum, types.SHORT), null, Flags.FLAG_NULL);
            MarshalUnMarshalHelper.serialize(ndr, new ComValue(this.listOfAdds.length, types.SHORT), null, Flags.FLAG_NULL);
            MarshalUnMarshalHelper.serialize(ndr, new ComValue(this.listOfDels.length, types.SHORT), null, Flags.FLAG_NULL);

            if (this.listOfAdds.length > 0) {
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(null, types.INTEGER), null, Flags.FLAG_NULL);
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(this.listOfAdds.length, types.INTEGER), null, Flags.FLAG_NULL);

                for (let i = 0; i < this.listOfAdds.length; i++) {
                    let oid = this.listOfAdds[i];
                    MarshalUnMarshalHelper.writeOctetArrayLE(ndr, Buffer.from(oid.getOID()));
                }
            } else {
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            }

            if (this.listOfDels.length > 0) {
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(null, types.INTEGER), null, Flags.FLAG_NULL);
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(this.listOfDels.length, types.INTEGER), null, Flags.FLAG_NULL);

                let index = ndr.getBuffer().getIndex();
                let k = Math.round(index % 8.0);
                k = (k == 0)? 0 : 8 - k;
                ndr.writeOctetArray(new Array(k), 0, k);

                for (let i = 0; i < this.listOfDels.length; i++) {
                    let oid = this.listOfDels[i];
                    MarshalUnMarshalHelper.writeOctetArrayLE(ndr, Buffer.from(oid.getOID()));
                }
            } else {
                MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            }

            MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            MarshalUnMarshalHelper.serialize(ndr, new ComValue(0, types.INTEGER), null, Flags.FLAG_NULL);
            break;
        default:
            // do nothing;
    }
  }

  /**
   * 
   * @param {NetworkDataRepresentation} ndr 
   */
  read(ndr) {
    switch(this.opnum) {
        case 1:
            let hresult = MarshalUnMarshalHelper.deSerialize(ndr, new ComValue(null, types.INTEGER), null, Flags.FLAG_NULL, null);
            if (hresult != 0) {
                console.log(new Error("Simple ping failed, hresult: " + hresult));
            } else {
                console.log("Simple Ping Succeeded");            }
            
        case 2:
            this.setId = MarshalUnMarshalHelper.readOctetArrayLE(ndr, 8);

            MarshalUnMarshalHelper.deSerialize(ndr, new ComValue(null, types.SHORT), null, Flags.FLAG_NULL, null);

            hresult = MarshalUnMarshalHelper.deSerialize(ndr, new ComValue(null, types.INTEGER), null, Flags.FLAG_NULL, null);

            if (hresult != 0) {
                console.log(new Error("Complex ping failed, hresult: " + hresult));
            } else {
                console.log("Complex Ping Succeeded, setId is: " + this.setId.toString());
            }
            break;
        default:
            //do nothing;
    }
  }
}
module.exports = PingObject;