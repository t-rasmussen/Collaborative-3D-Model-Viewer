class Actor{
    constructor(role){
        this.role = role;
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        this.color = [r,g,b];
        this.message = [];
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

    }

    addMessage(message){
        this.addMessage(message);
    }
}

export default Actor;