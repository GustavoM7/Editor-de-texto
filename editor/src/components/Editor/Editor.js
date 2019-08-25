import React, { Component } from 'react';
import Toolbar from './Toolbar';
import Modal from './Modal';
import './Editor.css';

class Editor extends Component {

    /*
        State:
            - inputField: guarda campo dinâmico para inputs
            - urls: guarda inputs de url
            - imageWidth: guarda valores (%) para dimensão de largura de imagem a ser inserida (default 20)
            - imageHeight: guarda valores (%) para dimensão de altura de imagem a ser inserida (default 20)
            - imageFile: guarda arquivo de imagem para upload
            - title: guarda valor de titulo para post da publicação (default titulo-{numero randomico})
            - range: guarda seleção de texto (para ser recuperada em caso de abertura de modal)

        Métodos:
            - format: recebe uma string de comando para aplicar formatação via DOM (com função nativa)
            - titles: recebe uma string com tamanho do título a ser aplicado e trata casos de formatação
            - linking: aplica formtação de link com url do state
            - inputs: recebe evento e manibula dados de inputs para o state
            - addVideo: gera iframe de video do youtube com url do state
            - addUrlImage: gera imagem atráves de url do state
            - addUploadImage: gera uma imagem por upload passando blob e chave do state, e callback para pai (backend)
            - createImage (auxiliar): recebe string com url e gera img no campo de edição
            - post: guarda o valor HTML do campo de edição e enviar para pai (backend)

        props:
            - updating: booleano, quando true, campo de edição recebe dados para update e seta saida para key existente
            - title: titulo para postagem em update
            - postImage: função de saída para upload de imagem
            - post: função de saída para HTML de campo de edição
            - defaultText: recebe texto default para campo de edição
    */

    state = {
        inputField: null,
        urls: "",
        imageWidth: 20,
        imageHeight: 20,
        imageFile: null,
        title: this.props.updatig ? this.props.title : "titulo-" + new Date().getTime(),
        range: null
    }

    //Função para manipular a fomatação html do campo de edição
    format = (commmand) =>{
        document.execCommand(commmand);
    }

    //Função para atribuir títulos html para trechos de texto no campo de edição
    titles = (width) =>{
        //Salvando intervalo selecionado
        let range = window.getSelection().getRangeAt(0);

        //Buscando nó atual do intervalo
        let node = range.startContainer.parentElement;        

        //Se intervalo já possui o título, tornar parágrafo
        if(node.nodeName === width.toUpperCase()){   
            document.execCommand("heading", null, "p");
        }
        //Se intervalo não possui o título, aplicar
        else {
            document.execCommand("heading", null, width);
        }
        
    }

    //Função para atribuir hiperlink para texto
    linking = () =>{
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(this.state.range);
        document.execCommand('CreateLink', false, this.state.urls);
    }

    //Função para controle de campos de inputs
    inputs = (e) =>{
        if(e.target.files){
            //Caso de input de imagem 
            this.setState({[e.target.name]: e.target.files[0]})
        }
        
        else {
            //Inputs comuns
            this.setState({[e.target.name]: e.target.value})
        }
        
    }

    //Função para adição de vídeo por ifram com link externo
    addVideo = () => {
        if(this.state.urls !== " "){
            let iframe = document.createElement("iframe");
            iframe.type = "text/html";
            iframe.height = "360";
            iframe.width = "80%";
            iframe.src= "https://www.youtube.com/embed/"+this.state.urls;

            let range = this.state.range
            range.insertNode(iframe);
        }
    }

    //Função para adicionar imagem por url
    addUrlImage = () => {
        this.createImage(this.state.urls);
    }

    //Função para adicionar imagem por upload
    addUploadImage = () => {
        //Recebendo aquivo do input
        if(this.state.imageFile){
            //Gerando key para o arquivo
            let key = new Date().getTime();

            //Enviando imagem, key e callback para gerar imagem
            this.props.postImg(this.state.imageFile, key, this.createImage);

        }
    }

    //Função para criar um elemento img no campo de edição
    createImage = (url) => {
        console.log("creating image")
        if(url){
            let img = document.createElement("img");
            img.src = url;
            img.style.width = this.state.imageWidth + "%";
            img.style.height = this.state.imageHeight + "%";

            let range = this.state.range;
            range.insertNode(img);
        }
    }

    //Função para publicação do texto no campo de edição
    post = () => {
        //Salvando HTML de saida
        let exitHtml = document.getElementById("editor").innerHTML;

        //Enviando para servidor por props
        this.props.post(exitHtml, this.state.title);
    }

    //Função para salvar seleção do campo de edição antes de abertura de modal ou ação semelhante
    saveRange = () => {
        this.setState({
            range: window.getSelection().getRangeAt(0),
        })
    }

    //Passando defaultText para campo de edição após montagem do componente
    componentDidMount(){
        let editor = document.getElementById("editor");
        editor.focus();
        editor.innerHTML = this.props.defaultText;
    }

    render(){
        return(
            <div className="editor-content">
                <h2 className="editor-content-title">NOVA PUBLICAÇÃO</h2>

                <Toolbar
                    format={this.format}
                    titles={this.titles}
                />

                {
                    //Modal para input de link para hiperlink
                }
                <Modal listenersId={["cancel-url", "openLink"]}>
                    <div className="editor-modal-children-conteint">
                        <h3 className="editor-content-title">ADICIONAR HIPERLINK</h3>
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="url-input">URL:</label>
                            <input className="editor-modal-children-conteint-input" name="urls" id="url-input" type="text" defaultValue={this.state.urls} onChange={this.inputs} />
                            <button className="editor-button" onClick={() => this.linking()}>Salvar</button>
                            <button id="cancel-url" className="editor-button">Cancelar</button>
                        </div>
                    </div>
                </Modal>

                {
                    //Modal para input de link para video do youtube
                }
                <Modal listenersId={["cancel-urlyt", "openYt"]}>
                    <div className="editor-modal-children-conteint">
                    <h3 className="editor-content-title">ADICIONAR VÍDEO DO YOUTUBE</h3>
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="url-input">YouTube URL:</label>
                            <input className="editor-modal-children-conteint-input" name="urls" id="url-input" type="text" onChange={this.inputs} defaultValue={this.state.urls}/>

                            <button className="editor-button" onClick={() => this.addVideo()}>Salvar</button>
                            <button className="editor-button" id="cancel-urlyt">Cancelar</button>
                        </div>
                    </div>
                </Modal>

                {
                    //Modal para escolha de tipo de imagem
                }
                <Modal listenersId={["cancel-choiceImage", "openImageChoices", "open-imageUrl", "open-imageUpload"]}>
                    <div className="editor-modal-children-conteint">
                    <h3 className="editor-content-title">SELEECIONE O TIPO DE IMAGEM</h3>
                        <div className="editor-modal-children-subconteint">
                           <button id="open-imageUrl" className="editor-button">Imagem url</button>
                            <button id="open-imageUpload" className="editor-button">Imagem upload</button>
                            <button id="cancel-choiceImage" className="editor-button">Cancelar</button> 
                        </div>
                        
                    </div>
                </Modal>

                {
                    //Modal para input de imagem por url
                }

                <Modal listenersId={["open-imageUrl", "cancel-imageUrl"]}>
                    <div className="editor-modal-children-conteint">
                    <h3 className="editor-content-title">ADICIONAR IMAGEM POR URL</h3>
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="url-input">URL:</label>
                            <input className="editor-modal-children-conteint-input" name="urls" id="url-input" type="text" onChange={this.inputs} defaultValue={this.state.urls}/>
                        </div>

                        <div className="editor-modal-children-subconteint">
                            <div>
                               <label htmlFor="width-input">Lagura: </label>
                                <input className="editor-modal-numberinput" name="imageWidth" id="width-input" type="number" onChange={this.inputs} defaultValue={this.state.imageWidth}/> 
                            </div>
                            
                            <div>
                                <label htmlFor="height-input">Altura: </label>
                                <input className="editor-modal-numberinput" name="imageHeight" id="height-input" type="number" onChange={this.inputs} defaultValue={this.state.imageHeight}/>
                            </div>  
                            
                        </div>
                        <div className="editor-modal-children-subconteint">
                            <button onClick={() => this.addUrlImage()} className="editor-button">Salvar</button>
                            <button id="cancel-imageUrl" className="editor-button">Cancelar</button>
                        </div>
                    </div>
                    
                </Modal>

                {
                    //Modal para input de imagem por upload
                }
                <Modal listenersId={["open-imageUpload", "cancel-ImageUpload"]}>
                    <div className="editor-modal-children-conteint">
                    <h3 className="editor-content-title">ADICIONAR IMAGEM POR UPLOAD</h3>
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="upload-input">Escolha um aquivo no computador:</label>
                            <input id="upload-input" type="file" accept="image/x-png,image/gif,image/jpeg" name="imageFile" onChange={this.inputs}/>
                        </div>
                        
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="width-input">Lagura:</label>
                            <input className="editor-modal-numberinput" name="imageWidth" id="width-input" type="number" onChange={this.inputs} defaultValue={this.state.imageWidth}/>
                            
                            <label htmlFor="height-input">Altura:</label>
                            <input className="editor-modal-numberinput" name="imageHeight" id="height-input" type="number" onChange={this.inputs} defaultValue={this.state.imageHeight}/>
                        </div>

                        <div className="editor-modal-children-subconteint">
                            <button className="editor-button" onClick={() => this.addUploadImage()}>Salvar</button>
                            <button id="cancel-ImageUpload" className="editor-button">Cancelar</button> 
                        </div>
                    </div>
                </Modal>

                {
                    //Modal para salve do texto editado
                }

                <Modal listenersId={["cancel-post", "salve"]}>
                    <div className="editor-modal-children-conteint">
                    <h3 className="editor-content-title">SALVAR POSTAGEM</h3>
                        <div className="editor-modal-children-subconteint">
                            <label htmlFor="title-input">Título:</label>
                            <input className="editor-modal-children-conteint-input" name="title" id="title-input" type="text" onChange={this.inputs} defaultValue={this.state.title}/>

                            <button onClick={() => this.post()} className="editor-button">Salvar</button>
                            <button id="cancel-post" className="editor-button">Cancelar</button>
                        </div>
                        
                    </div>
                </Modal>

                <div className="editor-paper" contentEditable="true" designmode="on" id="editor" spellCheck="true" onBlur={() => this.saveRange()}> 
    
                </div>

                <div className="controls-content">
                    <button id="salve" className="editor-button" >SALVAR</button>

                    <button className="editor-button" onClick={() => this.props.goBack(1)}>CANCELAR</button>
                </div>

            </div>
        )
    }
}

export default Editor;