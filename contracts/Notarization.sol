// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.16;

contract Notarization {
    uint256 private interactionCount;    
    address private messageSender;
    
    string private currentDocumentName;
    uint256 private currentDocumentDate;
    string private currentDocumentComments;
    address private currentDocumentOwner;
    uint256 private currentInteractionDate;
    
    bool private uploadResult;
    bool private checkResult;
    bool private removeResult;

    struct Document {
        string name;
        uint256 date;
        string comments;
        address owner;
        bool isSet;
    }

    struct Interaction {
        string name;
        uint256 date;
        address owner;
        
        string documentName;
        uint256 documentDate;
        string documentComments;
        address documentOwner;
        bool documentIsSet;
    }

    mapping(uint256 => Document) private documentMapping;
    mapping(uint256 => Interaction) private interactionMapping;

    event documentEntry(string _name, uint256 _date, string _comments, address indexed _owner, bool _isSet);
    event interactionEntry(string _name, uint256 _date, address indexed _owner, string _documentName, uint256 _documentDate, string _documentComments, address indexed _documentOwner, bool _documentIsSet);

    Document private emptyDocument;

    constructor() public {
        interactionCount = 0;
        messageSender = msg.sender;
        emptyDocument = Document("", 0, "", address(0), false);
    }

    function getInteractionCount() public view returns (uint256) {
        return interactionCount;
    }

    function getCurrentInteractionOwner() public view returns (address) {
        return messageSender;
    }

    function getCurrentDocumentName() public view returns (string memory) {
        return currentDocumentName;
    }

    function getCurrentDocumentDate() public view returns (uint256) {
        return currentDocumentDate;
    }

    function getCurrentDocumentComments() public view returns (string memory) {
        return currentDocumentComments;
    }

    function getCurrentDocumentOwner() public view returns (address) {
        return currentDocumentOwner;
    }

    function getCurrentInteractionDate() public view returns (uint256) {
        return currentInteractionDate;
    }

    function getUploadResult() public view returns (bool) {
        return uploadResult;
    }

    function getCheckResult() public view returns (bool) {
        return checkResult;
    }

    function getRemoveResult() public view returns (bool) {
        return removeResult;
    }

    function createDocument(string memory _name, string memory _comments) private view returns (Document memory) {
        return Document(_name, block.timestamp, _comments, messageSender, true);
    }

    function emitDocument(Document memory document) private {
        emit documentEntry(document.name, document.date, document.comments, document.owner, document.isSet);
    }

    function createInteraction(string memory _name, uint256 _hashValue) private view returns (Interaction memory) {
        Document memory document = documentMapping[_hashValue];
        return Interaction(_name, block.timestamp, messageSender, document.name, document.date, document.comments, document.owner, document.isSet);
    }

    function emitInteraction(Interaction memory interaction) private {
        emit interactionEntry(interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    function setCurrentDocument(Document memory document) private {
        currentDocumentName = document.name;
        currentDocumentDate = document.date;
        currentDocumentComments = document.comments;
        currentDocumentOwner = document.owner;
    }

    function setCurrentInteraction() private {
        currentInteractionDate = block.timestamp;
    }

    function getInteractionInfo(uint256 pos) public view returns (string memory, uint256, address, string memory, uint256, string memory, address, bool) {
        Interaction memory interaction = interactionMapping[pos];
        return (interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    function upload(string memory _name, uint256 _hashValue, string memory _comments, bool fullMode) public {
        uploadResult = documentMapping[_hashValue].isSet;
        Document memory document = createDocument(_name, _comments);
        documentMapping[_hashValue] = document;
        emitDocument(document);
        setCurrentDocument(document);
        
        if (fullMode) {
            Interaction memory interaction = createInteraction( uploadResult ? "Update" : "Upload", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }
    }

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
    
    function removeDocument(Document memory document, uint256 _hashValue) private {
        document.isSet = false;
        documentMapping[_hashValue] = document;
        emitDocument(document);
    }

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