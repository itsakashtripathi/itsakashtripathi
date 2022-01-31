/**
 * http://github.com/valums/file-uploader
 * 
 * Multiple file upload component with progress-bar, drag-and-drop. 
 * � 2010 Andrew Valums ( andrew(at)valums.com ) 
 * 
 * Licensed under GNU GPL 2 or later, see license.txt.
 */    

//
// Helper functions
//

var qq = qq || {};

// store uploaded files to add thumbnail (control_uploadv2)
qq.uploadedFiles = {};

/**
 * Emre: to protect submit button enable/disable problem (43334)
 */
qq.disableSubmitButton = function(){
    if ($$('.form-submit-button')) {
        $$('.form-submit-button').each(function (b) {
            //Emre: submit button problem (51335)
            if (b.className != "form-submit-button lastDisabled") {
                if (b.classList.contains('js-new-sacl-button') && b.innerText !== JotForm.texts.pleaseWait) {
                    b.oldText = b.innerText;
                }
                b.disable();
                b.innerHTML = JotForm.texts.pleaseWait;
                b.addClassName("disabled");
            }
        });
    }
};

qq.enableSubmitButton = function(){
	
	var liSize = $$('ul.qq-upload-list li').size() - $$('ul.qq-upload-list li.qq-upload-fail').size();
	if (liSize == $$('ul.qq-upload-list li.qq-upload-success').size()){
		if ($$('.form-submit-button')){
			$$('.form-submit-button').each(function(b){
				//Emre: submit button problem (51335)
				if (b.className!="form-submit-button lastDisabled"){
		            b.enable();
		            if (b.className.indexOf("disabled") > -1){
		            	b.removeClassName("disabled")
		            } else {
                               // don't rewrite classname when hide field on card form (1871152)
                               if (!qq.hasClass(b, 'jfInput-button')) {
                                 b.className = "form-submit-button";
                               }
		            }
                    if (b.oldText === undefined && typeof CardForm !== "undefined" && CardForm.layoutParams.reviewBeforeSubmit !== null) { // This should be temporary. If you are here, then ask sercan.
                        b.innerHTML = CardForm.layoutParams.reviewBeforeSubmit.reviewText;
                    } else {
    					b.innerHTML = b.oldText;
                    }
				}
	        });
		}
	}
};

/**
 * Adds all missing properties from second obj to first obj
 */ 
qq.extend = function(first, second){
    for (var prop in second){
        first[prop] = second[prop];
    }
};  

/**
 * Searches for a given element in the array, returns -1 if it is not present.
 * @param {Number} [from] The index at which to begin the search
 */
qq.indexOf = function(arr, elt, from){
    if (arr.indexOf){ return arr.indexOf(elt, from); }
    
    from = from || 0;
    var len = arr.length;    
    
    if (from < 0){ from += len;}  

    for (; from < len; from++){  
        if (from in arr && arr[from] === elt){  
            return from;
        }
    }  
    return -1;  
}; 
    
qq.getUniqueId = (function(){
    var id = 0;
    return function(){ return id++; };
})();

//
// Events

qq.attach = function(element, type, fn){
    if (element.addEventListener){
        element.addEventListener(type, fn, false);
    } else if (element.attachEvent){
        element.attachEvent('on' + type, fn);
    }
};
qq.detach = function(element, type, fn){
    if (element.removeEventListener){
        element.removeEventListener(type, fn, false);
    } else if (element.attachEvent){
        element.detachEvent('on' + type, fn);
    }
};

qq.preventDefault = function(e){
    if (e.preventDefault){
        e.preventDefault();
    } else{
        e.returnValue = false;
    }
};

//
// Node manipulations

/**
 * Insert node a before node b.
 */
qq.insertBefore = function(a, b){
    b.parentNode.insertBefore(a, b);
};
qq.remove = function(element){
    element.parentNode.removeChild(element);
};

qq.contains = function(parent, descendant){       
    // compareposition returns false in this case
    if (parent == descendant){ return true; }
    
    if (parent.contains){
        return parent.contains(descendant);
    } else {
        return !!(descendant.compareDocumentPosition(parent) & 8);
    }
};

/**
 * Creates and returns element from html string
 * Uses innerHTML to create an element
 */
qq.toElement = (function(){
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var element = div.firstChild;
        div.removeChild(element);
        return element;
    };
})();

//
// Node properties and attributes

/**
 * Sets styles for an element.
 * Fixes opacity in IE6-8.
 */
qq.css = function(element, styles){
    if (styles.opacity !== null){
        if (typeof element.style.opacity != 'string' && typeof(element.filters) != 'undefined'){
            styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
        }
    }
    qq.extend(element.style, styles);
};
qq.hasClass = function(element, name){
    var re = new RegExp('(^| )' + name + '( |$)');
    return re.test(element.className);
};
qq.addClass = function(element, name){
    if (!qq.hasClass(element, name)){
        element.className += ' ' + name;
    }
};
qq.removeClass = function(element, name){
    var re = new RegExp('(^| )' + name + '( |$)');
    element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
};
qq.setText = function(element, text){
    element.innerText = text;
    element.textContent = text;
};

//
// Selecting elements

qq.children = function(element){
    var children = [],
    child = element.firstChild;

    while (child){
        if (child.nodeType == 1){
            children.push(child);
        }
        child = child.nextSibling;
    }

    return children;
};

qq.getByClass = function(element, className){
    if (element && element.querySelectorAll){
        return element.querySelectorAll('.' + className);
    }

    var result = [];
    var candidates = element.getElementsByTagName("*");
    var len = candidates.length;

    for (var i = 0; i < len; i++){
        if (qq.hasClass(candidates[i], className)){
            result.push(candidates[i]);
        }
    }
    return result;
};

/**
 * obj2url() takes a json-object as argument and generates
 * a querystring. pretty much like jQuery.param()
 * 
 * how to use:
 *
 *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 * will result in:
 *
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  Object JSON-Object
 * @param  String current querystring-part
 * @return String encoded querystring
 */
qq.obj2url = function(obj, temp, prefixDone){
    var uristrings = [],
        prefix = '&',
        add = function(nextObj, i){
            var nextTemp = temp 
                ? (/\[\]$/.test(temp)) // prevent double-encoding
                   ? temp
                   : temp+'['+i+']'
                : i;
            if ((nextTemp != 'undefined') && (i != 'undefined')) {  
                uristrings.push(
                    (typeof nextObj === 'object') 
                        ? qq.obj2url(nextObj, nextTemp, true)
                        : (Object.prototype.toString.call(nextObj) === '[object Function]')
                            ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                            : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)                                                          
                );
            }
        }, i; 

    if (!prefixDone && temp) {
      prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
      uristrings.push(temp);
      uristrings.push(qq.obj2url(obj));
    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj != 'undefined') ) {
        // we wont use a for-in-loop on an array (performance)
        for (i = 0, len = obj.length; i < len; ++i){
            add(obj[i], i);
        }
    } else if ((typeof obj != 'undefined') && (obj !== null) && (typeof obj === "object")){
        // for anything else but a scalar, we will use for-in-loop
        for (i in obj){
            add(obj[i], i);
        }
    } else {
        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
    }

    return uristrings.join(prefix)
                     .replace(/^&/, '')
                     .replace(/%20/g, '+'); 
};

//
//
// Uploader Classes
//
//

qq = qq || {};
    
/**
 * Creates upload button, validates upload, but doesn't create file list or dd. 
 */
qq.FileUploaderBasic = function(o){
    this._options = {
        // set to true to see the server response
        debug: false,
        action: '/server/upload',
        params: {},
        button: null,
        multiple: true,
        maxConnections: 3,
        fileLimit: 0,
        // validation        
        allowedExtensions: [],               
        sizeLimit: 0,   
        minSizeLimit: 0,
        cancelText: 'Cancel',
        ofText: 'of',                             
        // events
        // return false to cancel submit
        onSubmit: function(id, fileName){},
        onProgress: function(id, fileName, loaded, total){},
        onComplete: function(id, fileName, responseJSON){},
        onCancel: function(id, fileName){},
        // messages                
        messages: {
            typeError: "{file} has invalid extension. Only {extensions} are allowed.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled.",
            fileLimitError: "Only {fileLimit} file uploads allowed."
        },
        showMessage: function(message){
            alert(message);
        }               
    };
    qq.extend(this._options, o);
        
    // number of files being uploaded
    this._filesInProgress = 0;
    this._handler = this._createUploadHandler(); 
    
    if (this._options.button){ 
        this._button = this._createUploadButton(this._options.button);
    }
                        
    this._preventLeaveInProgress();         
};
   
qq.FileUploaderBasic.prototype = {
    setParams: function(params){
        this._options.params = params;
    },
    getInProgress: function(){
        return this._filesInProgress;         
    },
    _createUploadButton: function(element){
        var self = this;
        
        return new qq.UploadButton({
            element: element,
            multiple: this._options.multiple && qq.UploadHandlerXhr.isSupported(),
            onChange: function(input){
                self._isRealImage(input);
            }        
        });           
    },    
    _createUploadHandler: function(){
        var self = this,
            handlerClass;        
        
        if(qq.UploadHandlerXhr.isSupported()){           
            handlerClass = 'UploadHandlerXhr';                        
        } else {
            handlerClass = 'UploadHandlerForm';
        }

        var handler = new qq[handlerClass]({
            debug: this._options.debug,
            action: this._options.action,         
            maxConnections: this._options.maxConnections,   
            onProgress: function(id, fileName, loaded, total){                
                self._onProgress(id, fileName, loaded, total);
                self._options.onProgress(id, fileName, loaded, total);                    
            },            
            onComplete: function(id, fileName, result, file){
                self._onComplete(id, fileName, result, file);
                self._options.onComplete(id, fileName, result, file);
            },
            onCancel: function(id, fileName){
                self._onCancel(id, fileName);
                self._options.onCancel(id, fileName);
            }
        });

        return handler;
    },    
    _preventLeaveInProgress: function(){
        var self = this;
        
        qq.attach(window, 'beforeunload', function(e){
            if (!self._filesInProgress){return;}
            
            e = e || window.event;
            // for ie, ff
            e.returnValue = self._options.messages.onLeave;
            // for webkit
            return self._options.messages.onLeave;
        });        
    },    
    _onSubmit: function(id, fileName){
        this._filesInProgress++;  
    },
    _onProgress: function(id, fileName, loaded, total){        
    },
    _onComplete: function(id, fileName, result){
        this._filesInProgress--;                 
        if (result.error){
            this._options.showMessage(result.error);
        }             
    },
    _onCancel: function(id, fileName){
        this._filesInProgress--;        
    },
    _onInputChange: function(input, isErrorOccured){
        JotForm.corrected(input);
        if(!isErrorOccured) {
            if (this._handler instanceof qq.UploadHandlerXhr){                
                this._uploadFileList(input.files);
                if (JotForm && JotForm.isSourceTeam && window.getFilesOfInput) {
                    setTimeout(function() {
                        window.getFilesOfInput(input).then(function(files) {
                            files.file.forEach(function(file) {
                                var previewItem = document.querySelector('li[actual-filename="'+ file.fileName +'"]');
                                if (previewItem) {
                                    var img = document.createElement('img');
                                    img.src = file.data;
                                    img.width = 48;
                                    img.height = 48;
                                    var span = document.createElement('span');
                                    span.className = 'qq-file-preview';
                                    span.append(img);
                                    previewItem.insertAdjacentElement('afterbegin', span);
                                    new Viewer(img);
                                }
                            });
                        });
                    }, 1500);
                }
            } else {             
                if (this._validateFile(input)){                
                    this._uploadFile(input);                                    
                }                      
            }
        } else {
            JotForm.errored(input, "You have uploaded an invalid image file type.");
        }

        // ** cardform hack ** cards listens for change but targeted input is removed from DOM so cannot detect which card
        // fire a manual change event from the parent to simulate a similar affect
        var parent = input.parentElement;
        if (parent) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, true);
            parent.dispatchEvent(event);
        }
        // ** end of cardForm hack

        this._button.reset();
    },
    _isRealImage: function(input){
        // Copying this reference
        var self = this;

        // Error occurence check
        var errorOccurences = [];

        // Byte to string converter
        var ab2str = function (buf) {
            var binaryString = '',
                 bytes = new Uint8Array(buf),
                 length = bytes.length;
            for (var i = 0; i < length; i++) {
                 binaryString += String.fromCharCode(bytes[i]);
            }
            return binaryString;
        };

        // Check to see if file content is valid
        var realFileCheck = function(input, index) {
            // End of recursion test
            if(input.files.length === index) {
                // Check if any error occured
                var isErrorOccured = errorOccurences.some(function(val) {
                    return val;
                });

                return self._onInputChange(input, isErrorOccured);
            }

            var file = input.files[index];
            var fileName = file.name;
            var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
            var hasImageExtension = self._checkImageExtension(fileExt);
            var isCheckPossible = file.type.indexOf('image') > -1 && hasImageExtension
            && typeof window.FileReader != 'undefined' && typeof window.ImageInfo != 'undefined';
            
            // Indicates whether real image check is possible or should be done
            if(!isCheckPossible) {
                errorOccurences.push(false);
                return realFileCheck(input, index + 1);
            }

            //initiate the FileReader
            var binary_reader = new FileReader();
            
            // On file upload complete
            binary_reader.onloadend = function (e) {
                 var args = {
                     filename: file.name,
                     size: file.size,
                     binary: ab2str(e.target.result)
                 };

                ImageInfo.loadInfo(args, function () {
                    var info = ImageInfo.getAllFields(fileName);
                    
                    // Assign validity
                    errorOccurences.push(info.format === 'UNKNOWN');

                    // Check other files too before reaching conculusion
                    return realFileCheck(input, index + 1);
                });
            }
            
            //read file as buffer array (binaryString is deprecated)
            binary_reader.readAsArrayBuffer(input.files[index]);
        };

        // Initial call
        realFileCheck(input, 0);
    },  
    _checkImageExtension: function(fileExt) {
        // Valid file extensions
        var validatedImageExt = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
        return (validatedImageExt.indexOf(fileExt.toLowerCase()) > -1);
    },   
    _uploadFileList: function(files){
        var i;
        for (i=0; i<files.length; i++){
            if ( !this._validateFile(files[i], files)){
                return;
            }            
        }
        
        for (i=0; i<files.length; i++){
            this._uploadFile(files[i]);        
        }        
    },
    _isFileuploadv2: function () {
        var uploadBtn = this._listElement.up('.form-line').querySelector('.jfUpload-button');
        return uploadBtn && uploadBtn.dataset.version === 'v2';
    },
    _uploadFile: function(fileContainer){    
    	//Emre
    	qq.disableSubmitButton();
        var id = this._handler.add(fileContainer);
        var fileName = this._handler.getName(id);
            
        if (this._options.onSubmit(id, fileName) !== false){
            this._onSubmit(id, fileName);
            this._handler.upload(id, this._options.params);
            if (this._isFileuploadv2()) {
                qq.uploadedFiles[fileContainer.name] = fileContainer;
            }
        }
    },      
    _validateFile: function(file, files){
        var name, size;
        if (file.value){
            // it is a file input            
            // get input value and remove path to normalize
            name = file.value.replace(/.*(\/|\\)/, "");
        } else {
            // fix missing properties in Safari
            //Emre: to prevent file name problem in firefox7 (47183)
            name = file.fileName ? file.fileName : file.name; 
            //Emre: to prevent file.fileSize being undefined in Firefox 7 - fileSize cannot be "0" (48526)
            size = file.fileSize ? file.fileSize : file.size;
        }
        //Emre: name returns 'file' in IE and it cause problem when conditions are used (50566)
        if (name == 'file'){
        	return false;
        }

        if (! this._isAllowedExtension(name)){            
            this._error('typeError', name);
            return false;
            
        } else if (size === 0){            
            this._error('emptyError', name);
            return false;
                                                     
        } else if (size && this._options.sizeLimit && size > this._options.sizeLimit){            
            this._error('sizeError', name);
            return false;
                        
        } else if (size && size < this._options.minSizeLimit){
            this._error('minSizeError', name);
            return false;            
        
        } else if (this._options.fileLimit > 0 && (this._element.select('.qq-upload-list').length > 0 && this._element.select('.qq-upload-list')[0].select('li').length - this._element.select('.qq-upload-list')[0].select('li.file-deleted').length + files.length > this._options.fileLimit)) {
            this._error('fileLimitError', name);
            return false;
        }
        
        return true;                
    },
    _error: function(code, fileName){
        var message = this._options.messages[code];        
        function r(name, replacement){ message = message.replace(name, replacement); }
        
        r('{file}', this._formatFileName(fileName, this._listElement.clientWidth));        
        r('{extensions}', this._options.allowedExtensions.join(', '));
        r('{sizeLimit}', this._formatSize(this._options.sizeLimit));
        r('{minSizeLimit}', this._formatSize(this._options.minSizeLimit));
        r('{fileLimit}', this._options.fileLimit);
        
        this._options.showMessage(message);                
    },
    _formatFileName: function(name, parentWidth){
        if (name.length > 33 && parentWidth > 600) {
            return name.slice(0, 19) + '...' + name.slice(-8);
        } else if (name.length > 15 && parentWidth < 600) {
            return name.slice(0, 7) + '...' + name.slice(-7);
        }
        return name;
    },
    _isAllowedExtension: function(fileName){
        var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
        var allowed = this._options.allowedExtensions;
        
        if (!allowed.length){return true;}        
        
        for (var i=0; i<allowed.length; i++){
            if (allowed[i].toLowerCase() == ext){ return true;}    
        }
        
        return false;
    },    
    _formatSize: function(bytes){
        var i = -1;                                    
        do {
            bytes = bytes / 1024;
            i++;  
        } while (bytes > 99);
        
        return Math.max(bytes, 0.1).toFixed(1) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];          
    }
};

qq.getUploaderTemplate = function(buttonText, fieldName) {
    var buttontext = buttonText.replace(/&amp;#039;/g, '\'').replace(/&amp;quot;/g, '"').replace(/&amp;/g, '&');
    var fieldID = fieldName.split('_')[1];
    return '<div class="qq-uploader">' +
    '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
    '<div class="qq-upload-button {buttonStyle}" aria-hidden="true">' + buttontext + '</div>' +
    '<div class="inputContainer"></div>' +
    '<label class="form-sub-label" for="' + fieldID + '" id="label_' + fieldID + '">{subLabel}</label>' +
    '<span style="display:none" class="multipleFileUploadLabels cancelText">{cancel}</span>' +
    '<span style="display:none" class="multipleFileUploadLabels ofText">{of}</span>' +
    '<ul class="qq-upload-list" aria-label="Uploaded files"></ul>' +
    '</div>';
}

qq.getUploadedFileTemplate = function() {
    return '<li tabindex="-1">' +
    '<span class="qq-upload-file qq-file-uploading"></span>' +
    '<span class="qq-upload-spinner"></span>' +
    '<a class="qq-upload-cancel" href="#">{Cancel}</a>' +
    '<span class="qq-upload-size"></span>' +
    '<span class="qq-upload-failed-text">Failed</span>' +
    '<span class="qq-upload-delete">X</span>' +
    '</li>';
}

qq.getUploaderSelectors = function() {
    return {
        // used to get elements from templates
        button: 'qq-upload-button',
        drop: 'qq-upload-drop-area',
        dropActive: 'qq-upload-drop-area-active',
        list: 'qq-upload-list',
                    
        file: 'qq-upload-file',
        spinner: 'qq-upload-spinner',
        size: 'qq-upload-size',
        cancel: 'qq-upload-cancel',
        deleteItem: 'qq-upload-delete',
        
        uploading: 'qq-file-uploading',
        
        // added to list item when upload completes
        // used in css to hide progress spinner
        success: 'qq-upload-success',
        fail: 'qq-upload-fail'
    };
}

/**
 * Class that creates upload widget with drag-and-drop and file list
 * @inherits qq.FileUploaderBasic
 */
qq.FileUploader = function(o){
    // call parent constructor
    qq.FileUploaderBasic.apply(this, arguments);
    
    // additional options
    qq.extend(this._options, {
        element: null,
        // if set, will be used instead of qq-upload-list in template
        listElement: null,
        subLabel:'',
        buttonText:'',
        template: qq.getUploaderTemplate(this._options.buttonText, this._options.params.field),
        // template for one item in file list
        fileTemplate: qq.getUploadedFileTemplate(),        
        classes: qq.getUploaderSelectors()
    });
    // overwrite options with user supplied    
    qq.extend(this._options, o);   

    this._element = this._options.element;

    this._element.innerHTML = this._options.template.replace('{subLabel}', this._options.subLabel).replace('{of}', this._options.ofText).replace('{cancel}', this._options.cancelText);


    if (this._options.buttonStyle) {
        this._element.innerHTML = this._element.innerHTML.replace('{buttonStyle}', this._options.buttonStyle);
    } else {
        this._element.innerHTML = this._element.innerHTML.replace('{buttonStyle}', '');
    }
    
    this._listElement = this._options.listElement || this._find(this._element, 'list');

    this._classes = this._options.classes;
        
    this._button = this._createUploadButton(this._find(this._element, 'button'));        
    
    this._bindCancelEvent();
    this._setupDragDrop();
};

// inherit from Basic Uploader
qq.extend(qq.FileUploader.prototype, qq.FileUploaderBasic.prototype);

qq.extend(qq.FileUploader.prototype, {
    /**
     * Gets one of the elements listed in this._options.classes
     **/
    _find: function(parent, type){                                
        var element = qq.getByClass(parent, this._options.classes[type])[0];        
        if (!element){
            throw new Error('element not found ' + type);
        }
        
        return element;
    },
    _setupDragDrop: function(){
        var self = this,
            dropArea = this._find(this._element, 'drop');                        

        var dz = new qq.UploadDropZone({
            element: dropArea,
            onEnter: function(e){
                qq.addClass(dropArea, self._classes.dropActive);
                e.stopPropagation();
            },
            onLeave: function(e){
                e.stopPropagation();
            },
            onLeaveNotDescendants: function(e){
                qq.removeClass(dropArea, self._classes.dropActive);  
            },
            onDrop: function(e){
                $$(".qq-upload-drop-area").each(function(drp) {
                    drp.hide();
                });
                qq.removeClass(dropArea, self._classes.dropActive);
                self._uploadFileList(e.dataTransfer.files);    
            }
        });
                
        dropArea.style.display = 'none';

        qq.attach(document, 'dragenter', function(e){
            if (!dz._isValidFileDrag(e)){ return; } 
            
            dropArea.style.display = 'block';            
        });                 
        qq.attach(document, 'dragleave', function(e){
            if (!dz._isValidFileDrag(e)){ return; }            
            
            var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
            // only fire when leaving document out
            if ( ! relatedTarget || relatedTarget.nodeName == "HTML" || relatedTarget.nodeName == "FORM"){               
                dropArea.style.display = 'none';                                            
            }

            // also fire when it triggers via mouseup or cursor leaves browser window
            // pageX and pageY always returns 0 in these conditions
            if (e.pageX === 0 && e.pageY === 0) {
                dropArea.style.display = 'none';
            }
        });  
    },
    _onSubmit: function(id, fileName){
        qq.FileUploaderBasic.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, fileName);  
    },
    _onProgress: function(id, fileName, loaded, total){
        qq.FileUploaderBasic.prototype._onProgress.apply(this, arguments);

        var item = this._getItemByFileId(id);
        try {
            var size = this._find(item, 'size');
            size.style.display = 'inline';
            if (this._isFileuploadv2()) {
                this._find(item, 'cancel').style = '';
            }
            
            var text; 
            if (loaded != total){
                var ofText = this._listElement.up('.form-line').down(".ofText").innerText;
                text = Math.round(loaded / total * 100) + '% '+ofText+' ' + this._formatSize(total);
            } else {
                text = this._formatSize(total);
            } 

            qq.setText(size, text);
        } catch(e) {
            if (e instanceof TypeError) {
                console.error(e);
             } else {
                throw e;
             }
        }
    },
    _onComplete: function(id, fileName, result, file){
        var self = this;
        qq.FileUploaderBasic.prototype._onComplete.apply(this, arguments);

        // mark completed
        var item = this._getItemByFileId(id);                
        qq.remove(this._find(item, 'cancel'));
        qq.remove(this._find(item, 'spinner'));
        var nameEl = this._find(item, 'uploading');
        nameEl.className = "qq-upload-file";
        
        if('message' in result) {
            item.writeAttribute('actual-filename', result.message);
            file.filename = result.message;
            window.sendMessageToJFMobile && self._addToFilesForMobile(file);
        }

        if (result.success){
            qq.addClass(item, this._classes.success);    
        } else {
            qq.addClass(item, this._classes.fail);
        }

        var qid = item.up('.form-line').id.split('id_')[1];
        JotForm.runConditionForId(qid);

        typeof qq.onUploadComplete === 'function' && qq.onUploadComplete(item, id, fileName, result, qid);
        //Emre
        qq.enableSubmitButton();

        // append the thumbnail if question theme version is v2
        var defaultFileIcon = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTQgMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01LjYgMC4zOTk5OTRIMS40QzAuNjI2NSAwLjM5OTk5NCAwLjAwNjk5OTk5IDEuMDI2NDkgMC4wMDY5OTk5OSAxLjc5OTk5TDAgMTAuMkMwIDEwLjk3MzUgMC42MjY1IDExLjYgMS40IDExLjZIMTIuNkMxMy4zNzM1IDExLjYgMTQgMTAuOTczNSAxNCAxMC4yVjMuMTk5OTlDMTQgMi40MjY0OSAxMy4zNzM1IDEuNzk5OTkgMTIuNiAxLjc5OTk5SDdMNS42IDAuMzk5OTk0WiIgZmlsbD0iIzU5NjQ3QyIvPgo8L3N2Zz4K'
        var uploadedFile = qq.uploadedFiles[fileName];
        if (this._isFileuploadv2() && uploadedFile) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedFile);
            fileReader.onloadend = function () {
                var thumbnail = document.createElement('img');
                var thumbnailContainer = document.createElement('div');
                thumbnailContainer.classList.add('qq-upload-img-container');
                var fileExt = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1, uploadedFile.name.length);
                var hasImageExtension = self._checkImageExtension(fileExt);
                if (hasImageExtension) {
                    thumbnail.src = fileReader.result;
                } else {
                    thumbnail.src = defaultFileIcon;
                    thumbnail.style.padding = '6px';
                    thumbnail.style.background = '#FFFFFF';
                }
                thumbnail.setAttribute('alt', '');
                thumbnailContainer.append(thumbnail);
                item.insertAdjacentElement('afterbegin', thumbnailContainer);
                delete qq.uploadedFiles[fileName];
            }
        }
    },
    _addToList: function(id, fileName){
        var self = this;
        var cancel =  this._listElement.up('.form-line').down(".cancelText").innerText;
        var item = qq.toElement(this._options.fileTemplate.replace(/\{Cancel\}/, cancel));

        item.qqFileId = id;

        // accessibility :: make delete buttons focusable
        var deleteElement = this._find(item, 'deleteItem');
        deleteElement.setAttribute('role', 'button');
        deleteElement.setAttribute('tabindex', 0);
        deleteElement.setAttribute('aria-label', 'Delete File');

        var fileElement = this._find(item, 'file');
        qq.setText(fileElement, this._formatFileName(fileName, this._listElement.clientWidth));
        this._find(item, 'size').style.display = 'none';

        qq.attach(deleteElement, 'click', function() {
            self._deleteFromList(item, fileName);
        });
        qq.attach(deleteElement, 'keypress', function(e) {
            if(e.keyCode === 32) self._deleteFromList(item, fileName);
        });

        if (this._isFileuploadv2()) {
            this._listElement.insertAdjacentElement('afterbegin', item);
            this._find(item, 'cancel').style.paddingRight = "10px";
            item.focus();
        } else {
            this._listElement.appendChild(item);
        }
    },
    _getQid: function() {
        var id = this._element.up('.form-line').id.split('id_')[1];
        if(id !== 0 && !id) {
            return;
        }
        return 'q' + id;
    },
    _addToFilesForMobile: function(file) {
        var qid = this._getQid();
        if(!qid) {
            return;
        }

        if(!window.filesForMobile) {
            window.filesForMobile = {};
        }

        window.filesForMobile[qid]
            ? window.filesForMobile[qid].push(file)
            : window.filesForMobile[qid] = [file];
    },
    _deleteFromFilesForMobile: function(fileNameToDelete) {
        var qid = this._getQid();
        if(!qid) {
            return;
        }

        var isDeleted = false;
        var fileArray = window.filesForMobile[qid];

        fileArray.forEach(function(f, index) {
            if (f && f.filename === fileNameToDelete && !isDeleted) {
                fileArray.splice(index, 1);
                isDeleted = true;
            }
        })
    },
    _deleteFromList: function(item, fileName){
        var self = this;
        var opts = this._options;
        var fileToDelete = item.readAttribute('actual-filename') ? item.readAttribute('actual-filename') : fileName;
        var qid = item.up('.form-line').id.split('id_')[1]
        var failed = item.className.indexOf('fail') >= 0;
        if (('JotForm' in window) && !item.hasAttribute('waiting')) {
            var itemParent = item.parentElement;
            if(!failed) {
                new Ajax.Jsonp(JotForm.server, {
                    parameters: {
                        action: 'removeTempUpload',
                        tempFolder: opts.params.folder,
                        field: opts.params.field,
                        fileName: fileToDelete
                    },
                    evalJSON: 'force',
                    onComplete: function(t) {
                        item.removeAttribute('waiting');
                        t = t.responseJSON || t;
                        if (t.success) {
                            window.sendMessageToJFMobile && self._deleteFromFilesForMobile(fileToDelete);
                            $(item).remove();
                            JotForm.corrected(item);
                            JotForm.runConditionForId(qid);

                            typeof opts.onDelete === 'function' && opts.onDelete(opts.params.folder, opts.params.field, fileToDelete);
                            typeof qq.onDelete === 'function' && qq.onDelete(qid, opts.params.folder, opts.params.field, fileToDelete);
                        } else {
                            JotForm.errored(item, t.error);
                        }

                        // fire change event -> cardForm needs change event to validate card
                        if (itemParent) {
                            itemParent.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                });
                item.setAttribute('waiting', true);
            } else {
                $(item).remove();
                window.sendMessageToJFMobile && self._deleteFromFilesForMobile(fileToDelete);
                JotForm.corrected(item);
                JotForm.runConditionForId(qid);
                // fire change event -> cardForm needs change event to validate card
                if (itemParent) {
                    itemParent.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    },
    _getItemByFileId: function(id){
        var item = this._listElement.firstChild;        
        
        // there can't be txt nodes in dynamically created list
        // and we can  use nextSibling
        while (item){            
            if (item.qqFileId == id){ return item; }            
            item = item.nextSibling;
        }          
    },
    /**
     * delegate click event for cancel link 
     **/
    _bindCancelEvent: function(){
        var self = this,
            list = this._listElement;            
        
        qq.attach(list, 'click', function(e){           
            e = e || window.event;
            var target = e.target || e.srcElement;
            
            if (qq.hasClass(target, self._classes.cancel)){                
                qq.preventDefault(e);
               
                var item = target.parentNode;
                self._handler.cancel(item.qqFileId);
                qq.remove(item);
            }
        });
    }    
});
    
qq.UploadDropZone = function(o){
    this._options = {
        element: null,  
        onEnter: function(e){},
        onLeave: function(e){},  
        // is not fired when leaving element by hovering descendants   
        onLeaveNotDescendants: function(e){},   
        onDrop: function(e){}                       
    };
    qq.extend(this._options, o); 
    
    this._element = this._options.element;
    
    this._disableDropOutside();
    this._attachEvents();   
};

qq.UploadDropZone.prototype = {
    _disableDropOutside: function(e){
        // run only once for all instances
        if (!qq.UploadDropZone.dropOutsideDisabled ){

            qq.attach(document, 'dragover', function(e){
                if (e.dataTransfer){
                    e.dataTransfer.dropEffect = 'none';
                    e.preventDefault(); 
                }           
            });
            
            qq.UploadDropZone.dropOutsideDisabled = true; 
        }        
    },
    _attachEvents: function(){
        var self = this;              
                  
        qq.attach(self._element, 'dragover', function(e){
            if (!self._isValidFileDrag(e)){ return; }
            
            var effect = e.dataTransfer.effectAllowed;
            if (effect == 'move' || effect == 'linkMove'){
                e.dataTransfer.dropEffect = 'move'; // for FF (only move allowed)    
            } else {                    
                e.dataTransfer.dropEffect = 'copy'; // for Chrome
            }
                                                     
            e.stopPropagation();
            e.preventDefault();                                                                    
        });
        
        qq.attach(self._element, 'dragenter', function(e){
            if (!self._isValidFileDrag(e)){ return; }
                        
            self._options.onEnter(e);
        });
        
        qq.attach(self._element, 'dragleave', function(e){
            if (!self._isValidFileDrag(e)) { return; }
            
            self._options.onLeave(e);
            
            var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);                      
            // do not fire when moving a mouse over a descendant
            if (qq.contains(this, relatedTarget)) { return; }
                        
            self._options.onLeaveNotDescendants(e); 
        });
                
        qq.attach(self._element, 'drop', function(e){
            if (!self._isValidFileDrag(e)) { return; }
            
            e.preventDefault();
            self._options.onDrop(e);
        });          
    },
    _isValidFileDrag: function(e){
        var dt = e.dataTransfer,
            // do not check dt.types.contains in webkit, because it crashes safari 4            
            isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;                        

        // Sentry #1542177212
        var isIE11atWin81 = navigator.userAgent.indexOf("NT 6.3; WOW64; Trident/7.0") > -1;
        var isIE11atWin7 = navigator.userAgent.indexOf("NT 6.1; WOW64; Trident/7.0") > -1;
        // dt.effectAllowed is none in Safari 5
        // dt.types.contains check is for firefox            
        return dt && (!isIE11atWin7 && !isIE11atWin81 && dt.effectAllowed != 'none') && 
            (dt.files || (!isWebkit && !isIE11atWin81 && !isIE11atWin7 && dt.types.contains && dt.types.contains('Files')));
        
    }        
}; 

qq.UploadButton = function(o){
    this._options = {
        element: null,  
        // if set to true adds multiple attribute to file input      
        multiple: false,
        // name attribute of file input
        name: 'file',
        onChange: function(input){},
        hoverClass: 'qq-upload-button-hover',
        focusClass: 'qq-upload-button-focus'                       
    };
    
    qq.extend(this._options, o);
        
    this._element = this._options.element;
    
    // make button suitable container for input
    qq.css(this._element, {
        position: 'relative',
        overflow: 'hidden',
        // Make sure browse button is in the right side
        // in Internet Explorer
        direction: 'ltr'
    });   
    
    this._input = this._createInput();
};

function triggerKeyPress(e) {
    if (e.keyCode === 32) {
        var input = e.target.querySelector('input');
        if(input) input.click();
    }
}

function triggerInputClick(e) {
    var input = e.target.querySelector('input');
    if(input) input.click();
}

qq.UploadButton.prototype = {
    /* returns file input element */    
    getInput: function(){
        return this._input;
    },
    /* cleans/recreates the file input */
    reset: function(){
        if (this._input.parentNode){
            qq.remove(this._input);    
        }
        
        qq.removeClass(this._element, this._options.focusClass);
        this._input = this._createInput();
    },
    _forwardInputClick: function (e) {
        var input = e.target.querySelector('input');
        if(input) input.click();
    },
    _forwardKeyPressSpace: function (e) {
        if (e.keyCode === 32) {
            var input = e.target.querySelector('input');
            if(input) input.click();
        }
    },
    _createInput: function(){
        var input = document.createElement("input");
        
        if (this._options.multiple){
            input.setAttribute("multiple", "multiple");
        }

        var qid = this._element.up('.form-line').id.split('id_')[1];
        input.addClassName("fileupload-input");
        input.setAttribute("id", "input_"+qid);
        input.setAttribute("type", "file");
        input.setAttribute("name", this._options.name);
        input.setAttribute("aria-labelledby", "label_"+qid);
        input.setAttribute("aria-hidden", true);
        input.setAttribute("tabindex", -1);
        
        var inputContainer = this._element.up().down('.inputContainer');
        inputContainer.update(input);
        inputContainer.setAttribute('role', 'button')
        if(window.FORM_MODE === 'cardform') {
            var uploadButtonView = this._element.up('.jfCard').down('.jfUpload-button');
            inputContainer.setAttribute('aria-label', uploadButtonView.innerHTML);
            uploadButtonView.addEventListener('keypress', function (e) {
                if ( e.keyCode === 13 || e.keyCode === 32 ) {
                    inputContainer.click();
                }
            });
        } else {
            var uploadButtonView = this._element.up().down('.qq-upload-button');
            inputContainer.setAttribute('aria-label', uploadButtonView.innerText);
        }
        inputContainer.setAttribute('tabindex', 0);

        inputContainer.removeEventListener('keypress', this._forwardKeyPressSpace);
        inputContainer.addEventListener('keypress', this._forwardKeyPressSpace);

        inputContainer.removeEventListener('click', this._forwardInputClick);
        inputContainer.addEventListener('click', this._forwardInputClick);

        function eventHack(eventName) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, true);
            inputContainer.dispatchEvent(event);
        }

        var self = this;
        
        function isUploaderInvisible() {
            return self._element.getWidth() === 0 && self._element.getHeight() === 0;
        }

        function alignButtons(covering, covered, cb) {
            var OFFSET_COVERAGE = 10;
            var width = (covered.getWidth() + OFFSET_COVERAGE) + "px";
            var height = (covered.getHeight() + OFFSET_COVERAGE) + "px";
            var left = (covered.offsetLeft - OFFSET_COVERAGE / 2) + "px";
            var top = (covered.offsetTop - OFFSET_COVERAGE / 2) + "px";

            if (cb && typeof cb === 'function') cb();
        }

        function alignButtonsAndAddListener(cb) {
            var uploadButtonEl

            if(window.FORM_MODE === 'cardform') {
                if(document.querySelector('.isVisible .qq-upload-button') === self._element) {
                    uploadButtonEl =  document.querySelector('.isVisible .jfUpload-button');
                }
            } else {
                uploadButtonEl = self._element;
            }

            if (!uploadButtonEl) return;

            alignButtons(inputContainer, uploadButtonEl, cb);
        
            window.addEventListener('resize', function(){ 
                alignButtons(inputContainer, uploadButtonEl); 
            });
        }

        var alignInterval = setInterval(function() {
            if(isUploaderInvisible()) return;

            alignButtonsAndAddListener(function() {
                clearInterval(alignInterval);
            });
            
        }, 250);

        qq.attach(input, 'change', function(){
            self._options.onChange(input);
        });
                
        qq.attach(input, 'mouseover', function(){
            qq.addClass(self._element, self._options.hoverClass);
        });
        qq.attach(input, 'mouseout', function(){
            qq.removeClass(self._element, self._options.hoverClass);
        });
        qq.attach(input, 'focus', function(){
            qq.addClass(self._element, self._options.focusClass);
            eventHack('focus');
        });
        qq.attach(input, 'blur', function(){
            qq.removeClass(self._element, self._options.focusClass);
            eventHack('blur');
        });

        // IE and Opera, unfortunately have 2 tab stops on file input
        // which is unacceptable in our case, disable keyboard access
        if (window.attachEvent){
            // it is IE or Opera
            input.setAttribute('tabIndex', "-1");
        }

        return input;            
    }        
};

/**
 * Class for uploading files, uploading itself is handled by child classes
 */
qq.UploadHandlerAbstract = function(o){
    this._options = {
        debug: false,
        action: '/upload.php',
        // maximum number of concurrent uploads        
        maxConnections: 999,
        onProgress: function(id, fileName, loaded, total){},
        onComplete: function(id, fileName, response){},
        onCancel: function(id, fileName){}
    };
    qq.extend(this._options, o);    
    
    this._queue = [];
    // params for files in queue
    this._params = [];
};
qq.UploadHandlerAbstract.prototype = {
    log: function(str){        
        if (this._options.debug && window.console){ console.log('[uploader] ' + str); }        
    },
    /**
     * Adds file or file input to the queue
     * @returns id
     **/    
    add: function(file){},
    /**
     * Sends the file identified by id and additional query params to the server
     */
    upload: function(id, params){
        var len = this._queue.push(id);

        var copy = {};        
        qq.extend(copy, params);
        this._params[id] = copy;        
                
        // if too many active uploads, wait...
        if (len <= this._options.maxConnections){               
            this._upload(id, this._params[id]);
        }
    },
    /**
     * Cancels file upload by id
     */
    cancel: function(id){
        this._cancel(id);
        this._dequeue(id);
    },
    /**
     * Cancells all uploads
     */
    cancelAll: function(){
        for (var i=0; i<this._queue.length; i++){
            this._cancel(this._queue[i]);
        }
        this._queue = [];
    },
    /**
     * Returns name of the file identified by id
     */
    getName: function(id){},
    /**
     * Returns size of the file identified by id
     */          
    getSize: function(id){},
    /**
     * Returns id of files being uploaded or
     * waiting for their turn
     */
    getQueue: function(){
        return this._queue;
    },
    /**
     * Actual upload method
     */
    _upload: function(id){},
    /**
     * Actual cancel method
     */
    _cancel: function(id){},     
    /**
     * Removes element from queue, starts upload of next
     */
    _dequeue: function(id){
        var i = qq.indexOf(this._queue, id);
        this._queue.splice(i, 1);
                
        var max = this._options.maxConnections;
        
        if (this._queue.length >= max){
            var nextId = this._queue[max-1];
            this._upload(nextId, this._params[nextId]);
        }
    }        
};

/**
 * Class for uploading files using form and iframe
 * @inherits qq.UploadHandlerAbstract
 */
qq.UploadHandlerForm = function(o){
    qq.UploadHandlerAbstract.apply(this, arguments);
       
    this._inputs = {};
};
// @inherits qq.UploadHandlerAbstract
qq.extend(qq.UploadHandlerForm.prototype, qq.UploadHandlerAbstract.prototype);

qq.extend(qq.UploadHandlerForm.prototype, {
    add: function(fileInput){
        fileInput.setAttribute('name', 'qqfile');
        var id = 'qq-upload-handler-iframe' + qq.getUniqueId();       
        
        this._inputs[id] = fileInput;
        
        // remove file input from DOM
        if (fileInput.parentNode){
            qq.remove(fileInput);
        }
                
        return id;
    },
    getName: function(id){
        // get input value and remove path to normalize
        return this._inputs[id].value.replace(/.*(\/|\\)/, "");
    },    
    _cancel: function(id){
        this._options.onCancel(id, this.getName(id));
        
        delete this._inputs[id];        

        var iframe = document.getElementById(id);
        if (iframe){
            // to cancel request set src to something else
            // we use src="javascript:false;" because it doesn't
            // trigger ie6 prompt on https
            iframe.setAttribute('src', 'javascript:false;');

            qq.remove(iframe);
        }
    },     
    _upload: function(id, params){                        
        var input = this._inputs[id];
        
        if (!input){
            throw new Error('file with passed id was not added, or already uploaded or cancelled');
        }                

        var fileName = this.getName(id);
                
        var iframe = this._createIframe(id);
        var form = this._createForm(iframe, params);
        form.appendChild(input);
        var self = this;
        this._attachLoadEvent(iframe, function(){                                 
            self.log('iframe loaded');
            
            var response = self._getIframeContentJSON(iframe);

            self._options.onComplete(id, fileName, response);
            self._dequeue(id);
            
            delete self._inputs[id];
            // timeout added to fix busy state in FF3.6
            setTimeout(function(){
                qq.remove(iframe);
            }, 1);
        });

        form.submit();        
        qq.remove(form);        
        
        return id;
    }, 
    _attachLoadEvent: function(iframe, callback){
        qq.attach(iframe, 'load', function(){
            // when we remove iframe from dom
            // the request stops, but in IE load
            // event fires
            if (!iframe.parentNode){
                return;
            }
            try{
                // fixing Opera 10.53
                if (iframe.contentDocument &&
                    iframe.contentDocument.body &&
                    iframe.contentDocument.body.innerHTML == "false"){
                    // In Opera event is fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    // when we upload file with iframe
                    return;
                }                
            }catch(e){}

            callback();
        });
    },
    /**
     * Returns json object received by iframe from server.
     */
    _getIframeContentJSON: function(iframe){
        try{
            // iframe.contentWindow.document - for IE<7
            var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
                response;
            
            this.log("converting iframe's innerHTML to JSON");
            this.log("innerHTML = " + doc.body.innerHTML);
                            
            try {
                response = eval("(" + doc.body.innerHTML + ")");
            } catch(err){
                response = {};
            }        
        }catch(e){
            response = {success:true};
        }

        return response;
    },
    /**
     * Creates iframe with unique name
     */
    _createIframe: function(id){
        // We can't use following code as the name attribute
        // won't be properly registered in IE6, and new window
        // on form submit will open
        // var iframe = document.createElement('iframe');
        // iframe.setAttribute('name', id);

        var iframe = qq.toElement('<iframe src="javascript:false;" name="' + id + '" />');
        // src="javascript:false;" removes ie6 prompt on https

        iframe.setAttribute('id', id);

        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        return iframe;
    },
    /**
     * Creates form, that will be submitted to iframe
     */
    _createForm: function(iframe, params){
        // We can't use the following code in IE6
        // var form = document.createElement('form');
        // form.setAttribute('method', 'post');
        // form.setAttribute('enctype', 'multipart/form-data');
        // Because in this case file won't be attached to request
        var form = qq.toElement('<form method="post" enctype="multipart/form-data"></form>');

        var queryString = qq.obj2url(params, this._options.action);

        form.setAttribute('action', queryString);
        form.setAttribute('target', iframe.name);
        form.style.display = 'none';
        document.body.appendChild(form);

        return form;
    }
});

/**
 * Class for uploading files using xhr
 * @inherits qq.UploadHandlerAbstract
 */
qq.UploadHandlerXhr = function(o){
    qq.UploadHandlerAbstract.apply(this, arguments);

    this._files = [];
    this._xhrs = [];
    
    // current loaded size in bytes for each file 
    this._loaded = [];
};

// static method
qq.UploadHandlerXhr.isSupported = function(){
    var input = document.createElement('input');
    input.type = 'file';        
    
    return (
        'multiple' in input &&
        typeof File != "undefined" &&
        typeof (new XMLHttpRequest()).upload != "undefined" );       
};

// @inherits qq.UploadHandlerAbstract
qq.extend(qq.UploadHandlerXhr.prototype, qq.UploadHandlerAbstract.prototype);

qq.extend(qq.UploadHandlerXhr.prototype, {
    /**
     * Adds file to the queue
     * Returns id to use with upload, cancel
     **/    
    add: function(file){
        if (!(file instanceof File)){
            throw new Error('Passed obj in not a File (in qq.UploadHandlerXhr)');
        }
        
        typeof qq.onUploadAdd === 'function' && qq.onUploadAdd(file, this._files);

        return this._files.push(file) - 1;
    },
    getName: function(id){        
        var file = this._files[id];
        // fix missing name in Safari 4
       //Emre: to prevent file name problem in firefox7 (47183)
        var name = file.fileName !== null ? file.fileName : file.name;   
        name = name ? name : file.name; 
        return name;
        
    },
    getSize: function(id){
        var file = this._files[id];
        return file.fileSize ? file.fileSize : file.size;
    },    
    /**
     * Returns uploaded bytes for file identified by id 
     */    
    getLoaded: function(id){
        return this._loaded[id] || 0; 
    },
    /**
     * Sends the file identified by id and additional query params to the server
     * @param {Object} params name-value string pairs
     */    
    _upload: function(id, params){
        var file = this._files[id],
            name = this.getName(id),
            size = this.getSize(id);
                
        this._loaded[id] = 0;
                                
        var xhr = (this._xhrs[id] = new XMLHttpRequest());
        this._xhrs[id].file = file;
        var self = this;
        
        xhr.upload.onprogress = function(e){
            if (e.lengthComputable){
                self._loaded[id] = e.loaded;
                self._options.onProgress(id, name, e.loaded, e.total);
            }
        };

        xhr.onreadystatechange = function(){            
            if (xhr.readyState == 4){
                self._onComplete(id, xhr);
            }
        };

        // build query string
        params = params || {};
        // escape from problematic characters in file name (Bugfix #1707858)
        params.qqfile = name.replace(/%/g, '');
        // params.qqfileSize = size;
        var queryString = qq.obj2url(params, this._options.action);
        xhr.open("POST", queryString, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("X-File-Name", encodeURIComponent(name));
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(file);
        
    },
    _onComplete: function(id, xhr){
        // the request was aborted/cancelled
        if (!this._files[id]) { return; }
        
        var name = this.getName(id);
        var size = this.getSize(id);
        
        this._options.onProgress(id, name, size, size);
        
        if (xhr.status == 200){
            this.log("responseText = " + xhr.responseText);
            var response;

            try {
                response = eval("(" + xhr.responseText + ")");
            } catch(err){
                response = {};
            }
            this._options.onComplete(id, name, response, this._xhrs[id].file);
                        
        } else {                   
            this._options.onComplete(id, name, {}, this._xhrs[id].file);
        }
                
        this._files[id] = null;
        this._xhrs[id] = null;    
        this._dequeue(id);                    
    },
    _cancel: function(id){
        this._options.onCancel(id, this.getName(id));
        
        this._files[id] = null;
        
        if (this._xhrs[id]){
            this._xhrs[id].abort();
            this._xhrs[id] = null;                                   
        }
        // enable submit button.
        setTimeout(function(){
        	qq.enableSubmitButton();
        }, 100);
    }
});
