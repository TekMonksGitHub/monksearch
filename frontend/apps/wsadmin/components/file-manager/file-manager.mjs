/* 
 * (C) 2020 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {xhr} from "/framework/js/xhr.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

let mouseX, mouseY, menuOpen, timer, selectedPath, selectedIsDirectory, selectedElement, filesAndPercents;

const DIALOG_HIDE_WAIT = 1300;

const API_GETFILES = APP_CONSTANTS.BACKEND+"/apps/"+APP_CONSTANTS.APP_NAME+"/getfiles";
const API_UPLOADFILE = APP_CONSTANTS.BACKEND+"/apps/"+APP_CONSTANTS.APP_NAME+"/uploadfile";
const API_DELETEFILE = APP_CONSTANTS.BACKEND+"/apps/"+APP_CONSTANTS.APP_NAME+"/deletefile";

const IO_CHUNK_SIZE = 4096;   // 4K read buffer

async function elementConnected(element) {
   menuOpen = false; 

   const path = element.getAttribute("path") || "/"; selectedPath = path.replace(/[\/]+/g,"/"); selectedIsDirectory = true;
   let resp = await xhr.rest(API_GETFILES, "GET", {path});
   if (!resp.result) return;

   resp.entries.unshift({name: await i18n.get("Upload", session.get($$.MONKSHU_CONSTANTS.LANG_ID)), path, stats:{upload: true}});

   if (!path.match(/^[\/]+$/g)) { // add in back and home buttons
      let parentPath = path.substring(0, path.lastIndexOf("/")); if (parentPath == "") parentPath = "/";
      resp.entries.unshift({name: await i18n.get("Back", session.get($$.MONKSHU_CONSTANTS.LANG_ID)), path:parentPath, stats:{back: true}});
      resp.entries.unshift({name: await i18n.get("Home", session.get($$.MONKSHU_CONSTANTS.LANG_ID)), path:"/", stats:{home: true}});
   }

   let data = {entries: resp.entries};

   if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
   
   if (element.id) {
       if (!file_manager.datas) file_manager.datas = {}; file_manager.datas[element.id] = data;
   } else file_manager.data = data;
}

async function elementRendered(element) {
   document.addEventListener("mousemove", e => {mouseX = e.pageX; mouseY = e.pageY;});

   document.addEventListener("click", _e => {
      if (!menuOpen) return;

      const shadowRoot = file_manager.getShadowRootByHostId(element.getAttribute("id"));
      shadowRoot.querySelector("div#contextmenu").classList.remove("visible")
      menuOpen = false;
   });
}

function handleClick(element, path, isDirectory) {
   selectedPath = path.replace(/[\/]+/g,"/"); selectedIsDirectory = util.parseBoolean(isDirectory); selectedElement = element;
   if (timer) {clearTimeout(timer); editFile(element); timer=null;}
   else timer = setTimeout(_=> {timer=null;showMenu(element)}, 200);
}

function upload(containedElement) {
   filesAndPercents = {};  // reset progress indicator bucket
   file_manager.getShadowRootByContainedElement(containedElement).querySelector("input#upload").click();
}

const uploadFiles = async (element, files) => {for (const file of files) await uploadAFile(element, file)}

async function uploadAFile(element, file) {
   const totalChunks = Math.ceil(file.size / IO_CHUNK_SIZE); const lastChunkSize = file.size - (totalChunks-1)*IO_CHUNK_SIZE;
   const waitingReaders = [];

   const queueReadFileChunk = (fileToRead, chunkNumber, resolve, reject) => {
      const reader = new FileReader();
      const onloadFunction = async loadResult => {
         const resp = await xhr.rest(API_UPLOADFILE, "POST", {data:loadResult.target.result, path:`${selectedPath}/${fileToRead.name}`});
         if (!resp.result) reject(); else {
            resolve(); 
            showProgress(element, chunkNumber+1, totalChunks, fileToRead.name);
            if (waitingReaders.length) (waitingReaders.pop())();  // issue next chunk read if queued reads
         }
      }
      reader.onload = onloadFunction;
      reader.onerror = _loadResult => {waitingOnRead = false; reject();}
      const sizeToRead = chunkNumber == totalChunks-1 ? lastChunkSize : IO_CHUNK_SIZE;
      // queue reads if we are waiting for a chunk to be returned, so the writes are in correct order 
      waitingReaders.unshift(_=>{reader.readAsDataURL(fileToRead.slice(IO_CHUNK_SIZE*chunkNumber, IO_CHUNK_SIZE*chunkNumber+sizeToRead));});
   }

   const startReaders = _ => {if (waitingReaders.length) (waitingReaders.pop())()}

   let readPromises = []; 
   for (let i = 0; i < totalChunks; i++) readPromises.push(new Promise((resolve, reject) => queueReadFileChunk(file, i, resolve, reject)));
   startReaders();   // kicks off the first read in the queue, which then fires others 
   return Promise.all(readPromises);
}

function showMenu(element) {
   const shadowRoot = file_manager.getShadowRootByContainedElement(element);

   if (element.getAttribute("id") && (element.getAttribute("id") == "home" || element.getAttribute("id") == "back" || element.getAttribute("id") == "upload")) {
      shadowRoot.querySelector("div#contextmenu > span#hr").classList.add("hidden"); 
      shadowRoot.querySelector("div#contextmenu > span#deletefile").classList.add("hidden");  
   } else {
      shadowRoot.querySelector("div#contextmenu > span#hr").classList.remove("hidden"); 
      shadowRoot.querySelector("div#contextmenu > span#deletefile").classList.remove("hidden");  
   }

   const contextMenu = shadowRoot.querySelector("div#contextmenu");
   contextMenu.style.top = mouseY+"px"; contextMenu.style.left = mouseX+"px";
   contextMenu.classList.add("visible");   
   menuOpen = true;
}

async function deleteFile(_element) {
   let resp = await xhr.rest(API_DELETEFILE, "GET", {path: selectedPath});
   if (resp.result) router.reload(); else alert("Error");
}

function editFile(_element) {
   if (selectedIsDirectory) {
      const urlToLoad = util.replaceURLParamValue(session.get($$.MONKSHU_CONSTANTS.PAGE_URL), "path", selectedPath);
      router.loadPage(urlToLoad);
   }

   if (selectedElement.id == "upload") upload(selectedElement);
}

async function showProgress(element, currentBlock, totalBlocks, fileName) {
   const templateID = "progressdialog"; const hostElementID = "templateholder";
   const shadowRoot = file_manager.getShadowRootByContainedElement(element);

   let template = shadowRoot.querySelector(`template#${templateID}`).innerHTML; 
   const matches = /<!--([\s\S]+)-->/g.exec(template);
   if (!matches) return; template = matches[1]; // can't show progress if the template is bad
   filesAndPercents[fileName] = Math.round(currentBlock/totalBlocks*100); 
   const files = []; for (const file of Object.keys(filesAndPercents)) files.push({name: file, percent: filesAndPercents[file]});
   const rendered = await router.expandPageData(template, session.get($$.MONKSHU_CONSTANTS.PAGE_URL), {files});
   shadowRoot.querySelector(`#${hostElementID}`).innerHTML = rendered;

   closeProgressAndReloadIfAllFilesUploaded(element, hostElementID, filesAndPercents);
}

function closeProgressAndReloadIfAllFilesUploaded(element, hostElementID, filesAndPercents) {
   for (const file of Object.keys(filesAndPercents)) if (filesAndPercents[file] != 100) return;
   setTimeout(_=>{hideDialog(element, hostElementID); router.reload();}, DIALOG_HIDE_WAIT); // hide dialog if all files done, after a certian wait
}

function hideDialog(element, hostElementID) {
   const hostElement = file_manager.getShadowRootByContainedElement(element).querySelector(`#${hostElementID}`);
   while (hostElement && hostElement.firstChild) hostElement.removeChild(hostElement.firstChild);
}

function register() {
   // convert this all into a WebComponent so we can use it
   monkshu_component.register("file-manager", `${APP_CONSTANTS.APP_PATH}/components/file-manager/file-manager.html`, file_manager);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM

export const file_manager = {trueWebComponentMode, register, elementConnected, elementRendered, handleClick, showMenu, deleteFile, editFile, upload, uploadFiles, hideDialog}