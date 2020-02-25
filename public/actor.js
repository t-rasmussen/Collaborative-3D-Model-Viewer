class Actor{
    constructor(name, colorString, id){
        this.name = name;
      
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        this.color = [r,g,b];
        if(colorString == "red"){
            this.color = [255, 0, 0];
        }
        else if(colorString == "blue"){
            this.color = [0, 0, 255];
        }
        else if(colorString == "yellow"){
            this.color = [255, 255, 0];
        }
        else if(colorString == "green"){
            this.color = [0, 255, 0];
        }
        else if(colorString == "violet"){
            this.color = [238,130,238];
        }
        else if(colorString == "orange"){
            this.color = [255, 165, 0];
        }


        this.id = id;
        this.messages = [];
    }

    set Name(name){
        this.name;
    }

    get Name(){
        return this.name;
    }

    set SelectedObject(selectedObject){
        this.selectedObject = selectedObject;
    }

    get SelectedObject(){
        return this.selectedObject;
    }

    set Color(colorString){
        if(colorString == "red"){
            this.color = [255, 0, 0];
        }
        else if(colorString == "blue"){
            this.color = [0, 0, 255];
        }
        else if(colorString == "yellow"){
            this.color = [255, 255, 0];
        }
        else if(colorString == "green"){
            this.color = [0, 255, 0];
        }
        else if(colorString == "violet"){
            this.color = [238,130,238];
        }
        else if(colorString == "orange"){
            this.color = [255, 165, 0];
        }
    }

    get Color(){
        return this.color;
    }

    set Id(id){
        this.id = id;
    }

    get Id(){
        return this.id;
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