class ObjectPiece{
    constructor(object){
        this.object = object;
        this.messages = [];
        this.status = "waiting"; 
        //Not fabricated, in fabrication, fabricated, assembled 
    }

    get Object(){
        return this.object;
    }

    get Messages(){
        this.messages;
    }

    addMessage(message){
        this.messages.push(message);
    }

    set FabricationStatus(status){
        this.status = status;
    }

    get FabricationStatus(){
        return this.status;
    }

    get Id(){
        return this.object.uuid;
    }


}

export default ObjectPiece;