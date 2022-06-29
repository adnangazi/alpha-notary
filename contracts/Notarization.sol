// for Solidity best practice
// SPDX-License-Identifier: MIT

// compiler compatibility
pragma solidity >= 0.5.16;

contract Notarization {
    uint256 private interactionCount;
    address private messageSender;
    uint256 private currentInteractionDate;
    bool private uploadResult;
    bool private checkResult;
    bool private removeResult;

    /**
    * Document object containing all the information wanted to save for each document notarized
    */
    struct Document {
        string name;
        uint256 date;
        string comments;
        address owner;
        bool isSet;
    }

    /**
    * Interaction object containing all the information wanted to save for each interaction with the Blockchain
    */
    struct Interaction {
        string name;
        uint256 date;
        address owner;
        
        // each interaction involves a Document, but it is forbidden to have structs that contain other struct objects
        string documentName;
        uint256 documentDate;
        string documentComments;
        address documentOwner;
        bool documentIsSet;
    }

    /**
    * hash map list of Documents
    * 
    * @ param number that stands for the hash code
    * @ return Document object in the position of the hash code mapped
    */
    mapping(uint256 => Document) private documentMapping;
    
    /**
    * hash map list of Interactions
    * 
    * @ param number that stands for the hash code
    * @ return Interaction object in the position of the hash code mapped
    */
    mapping(uint256 => Interaction) private interactionMapping;

    /**
    * event to emit a Document change to the Blockchain
    * 
    * @param _name string of the name of the Document
    * @param _date number of the date of the initial upload
    * @param _comments string of the comments of the Document
    * @param _owner address of the owner of the Interaction
    * @param _isSet bool to identify if a Document is set correctly
    */
    event documentEntry(string _name, uint256 _date, string _comments, address indexed _owner, bool _isSet);

    /**
    * event to emit an Interaction change to the Blockchain
    * 
    * @param _name string of the type of the Interaction
    * @param _date number of the date of the Interaction
    * @param _owner address of the owner of the Interaction
    * 
    * @param _documentName string of the name of the Document
    * @param _documentDate number of the date of the initial upload
    * @param _documentComments string of the comments of the Document
    * @param _documentOwner string of the owner of the Interaction that uploaded the Document first
    * @param _documentIsSet bool to identify if a Document is set correctly 
    */
    event interactionEntry(string _name, uint256 _date, address indexed _owner, string _documentName, uint256 _documentDate, string _documentComments, address indexed _documentOwner, bool _documentIsSet);

    Document private currentDocument;
    Document private emptyDocument;

    /**
    * initialize the needed attributes
    */
    constructor() public {
        interactionCount = 0;
        messageSender = msg.sender;
        emptyDocument = Document("", 0, "", address(0), false);
    }

    /**
    * get the Interaction count
    * 
    * @return interactionCount number of the current Interaction
    */
    function getInteractionCount() public view returns (uint256) {
        return interactionCount;
    }

    /**
    * get the current Interaction owner
    * 
    * @return messageSender address of the current owner of Interactions
    */
    function getCurrentInteractionOwner() public view returns (address) {
        return messageSender;
    }

    /**
    * get the current Document name
    * 
    * @return name string of the current Document name
    */
    function getCurrentDocumentName() public view returns (string memory) {
        return currentDocument.name;
    }

    /**
    * get the current Document date
    * 
    * @return date number of the date of the current Document upload date
    */
    function getCurrentDocumentDate() public view returns (uint256) {
        return currentDocument.date;
    }

    /**
    * get the current Document comments
    * 
    * @return comments string of the comments of the current Document
    */
    function getCurrentDocumentComments() public view returns (string memory) {
        return currentDocument.comments;
    }

    /**
    * get the current Document owner
    * 
    * @return owner address of the owner of the Interaction that uploaded the current Document 
    */
    function getCurrentDocumentOwner() public view returns (address) {
        return currentDocument.owner;
    }

    /**
    * get the current Interaction date
    * 
    * @return date number of the date of the current Interaction date
    */
    function getCurrentInteractionDate() public view returns (uint256) {
        return currentInteractionDate;
    }

    /**
    * get the upload result
    * 
    * @return uploadResult bool of the status of the latest upload
    */
    function getUploadResult() public view returns (bool) {
        return uploadResult;
    }

    /**
    * get the check result
    * 
    * @return checkResult bool of the status of the latest check
    */
    function getCheckResult() public view returns (bool) {
        return checkResult;
    }

    /**
    * get the remove result
    * 
    * @return removeResult bool of the status of the latest remove
    */
    function getRemoveResult() public view returns (bool) {
        return removeResult;
    }

    /**
    * create a new Document
    * 
    * @param _name string of the name of the Document
    * @param _comments string of the comments of the Document
    * 
    * @return a new Document
    */
    function createDocument(string memory _name, string memory _comments) private view returns (Document memory) {
        return Document(_name, block.timestamp, _comments, messageSender, true);
    }

    /**
    * emit a Document
    * 
    * @param document Document to emit
    */
    function emitDocument(Document memory document) private {
        emit documentEntry(document.name, document.date, document.comments, document.owner, document.isSet);
    }

    /**
    * create a new Interaction
    * 
    * @param _name string of the type of the Interaction
    * @param _hashValue number of the hash code of the Document of the Interaction
    * 
    * @return a new Interaction
    */
    function createInteraction(string memory _name, uint256 _hashValue) private view returns (Interaction memory) {
        Document memory document = documentMapping[_hashValue];
        return Interaction(_name, block.timestamp, messageSender, document.name, document.date, document.comments, document.owner, document.isSet);
    }

    /**
    * emit an Interaction
    * 
    * @param interaction Interaction to emit
    */
    function emitInteraction(Interaction memory interaction) private {
        emit interactionEntry(interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    /**
    * set the current Document
    * 
    * @param document Document of the values to use
    */
    function setCurrentDocument(Document memory document) private {
        currentDocument.name = document.name;
        currentDocument.date = document.date;
        currentDocument.comments = document.comments;
        currentDocument.owner = document.owner;
    }

    /**
    * set the current Interaction date time the current one
    */
    function setCurrentInteraction() private {
        currentInteractionDate = block.timestamp;
    }

    /**
    * get the Interaction information
    * 
    * @param pos number of the hash code of the position of the Interaction wanted
    * 
    * @return list containing the name, date, owner, Document name, Document initial upload date, Document comments, owner of the Interaction that uploaded the Document, and the flag that indicates if the document is set correctly, of the current Interaction 
    */
    function getInteractionInfo(uint256 pos) public view returns (string memory, uint256, address, string memory, uint256, string memory, address, bool) {
        Interaction memory interaction = interactionMapping[pos];
        // can't return an Interaction Object because is not a struct known outside of this Smart Contract
        return (interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    /**
    * upload or update a Document, and eventually record the Interaction
    * 
    * @param _name string of the name of the Document
    * @param _hashValue number of the hash code of the Document
    * @param _comments string of the comments of the Document
    * @param fullMode bool to identify if to record the Interaction
    */
    function upload(string memory _name, uint256 _hashValue, string memory _comments, bool fullMode) public {
        uploadResult = documentMapping[_hashValue].isSet;
        Document memory document = createDocument(_name, _comments);
        documentMapping[_hashValue] = document;
        emitDocument(document);
        setCurrentDocument(document);
        
        if (fullMode) {
            Interaction memory interaction = createInteraction(uploadResult ? "Update" : "Upload", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }
    }

    /**
    * check the existence of a Document, and eventually record the Interaction
    * 
    * @param _hashValue number of the hash code of the Document
    * @param fullMode bool to identify if to record the Interaction
    */
    function check(uint256 _hashValue, bool fullMode) public {
        if(fullMode) {
            Interaction memory interaction = createInteraction("Check", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }

        Document memory document = documentMapping[_hashValue];
        checkResult = document.isSet;
        setCurrentDocument(checkResult ? document : emptyDocument);
        setCurrentInteraction();
    }
    
    /**
    * set a Document so it is removed
    * 
    * @param document Document to set removed
    * @param _hashValue number of the hash code of the Document
    */
    function removeDocument(Document memory document, uint256 _hashValue) private {
        document.isSet = false;
        documentMapping[_hashValue] = document;
        emitDocument(document);
    }

    /**
    * remove a Document if already exists, and eventually record the Interaction
    * 
    * @param _hashValue number of the hash code of the Document
    * @param fullMode bool to identify if to record the Interaction
    */
    function remove(uint256 _hashValue, bool fullMode) public {
        if(fullMode) {
            Interaction memory interaction = createInteraction("Remove", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }

        Document memory document = documentMapping[_hashValue];
        removeResult = document.isSet;
        setCurrentDocument(removeResult ? document : emptyDocument);
        setCurrentInteraction();

        if (removeResult) {
            removeDocument(document, _hashValue);
        }
    }
}