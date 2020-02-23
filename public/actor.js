class Actor{
    constructor(role){
        this.role = role;
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        this.color = [r,g,b];
        this.messages = [];

        if(this.role == "Nicky"){
            this.color = [29,201,183];
        }
        else if(this.role == "Ryan"){
            this.color = [88,103,221];
        }
        else if(this.role == "Troels"){
            this.color = [253,57,122];
        }
    }

    set Role(role){
        this.role = role;
       
        if(this.role == "Nicky"){
            this.color = [29,201,183];
        }
        else if(this.role == "Ryan"){
            this.color = [88,103,221];
        }
        else if(this.role == "Troels"){
            this.color = [253,57,122];
        }
    }

    get Role(){
        return this.role;
    }

    set SelectedObject(selectedObject){
        this.selectedObject = selectedObject;
    }

    get SelectedObject(){
        return this.selectedObject;
    }

    get Color(){
        return this.color;
    }

    get Messages(){
        return this.messages;
    }

    addMessage(message){
        this.messages.push(message);
    }

    set HeadObject(object){
        this.headObject = object;
    }

    get HeadObject(){
        return this.headObject;
    }
}

export default Actor;