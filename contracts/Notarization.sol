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

    function getInteractionInfo(uint256 pos) public view returns (string memory, uint256, address, string memory, uint256, string memory, address, bool) {
        Interaction storage interaction = interactionMapping[pos];
        return (interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    function getInteractionCount() public view returns (uint256) {
        return interactionCount;
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

    function getCurrentInteractionOwner() public view returns (address) {
        return messageSender;
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

    function upload(string memory _name, uint256 _hashValue, string memory _comments, bool fullMode) public returns (bool) {
        bool result = documentMapping[_hashValue].isSet;

        if (fullMode) {
            Interaction memory interaction = createInteraction(result ? "update" : "upload", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }

        Document memory document = createDocument(_name, _comments);
        documentMapping[_hashValue] = document;
        emitDocument(document);
        setCurrentDocument(document);

        return result;
    }

    function check(uint256 _hashValue, bool fullMode) public returns (bool) {
        if(fullMode) {
            Interaction memory interaction = createInteraction("check", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }

        Document memory document = documentMapping[_hashValue];
        bool result = document.isSet;
        setCurrentDocument(result ? document : emptyDocument);
        setCurrentInteraction();
        
        return result;
    }
    
    function removeDocument(Document memory document, uint256 _hashValue) private {
        document.isSet = false;
        documentMapping[_hashValue] = document;
        emitDocument(document);
    }

    function remove(uint256 _hashValue, bool fullMode) public returns(bool) {
        if(fullMode) {
            Interaction memory interaction = createInteraction("remove", _hashValue);
            interactionMapping[interactionCount++] = interaction;
            emitInteraction(interaction);
        }

        Document memory document = documentMapping[_hashValue];
        bool result = document.isSet;
        setCurrentDocument(result ? document : emptyDocument);
        setCurrentInteraction();

        if (result) {
            removeDocument(document, _hashValue);
        }

        return result;
    }
}