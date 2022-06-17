// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.0;

contract Notarization {
    uint256 documentCount;
    uint256 interactionCount;

    bool updateStatus;
    bool removeStatus;

    string currentDocumentName;
    uint256 currentDocumentDate;
    uint256 currentDocumentHashValue;
    string currentDocumentComments;
    address currentDocumentOwner;
    
    address messageSender;
    address emptyAddress;

    struct Document {
        string name;
        uint256 date;
        uint256 hashValue;
        string comments;
        address owner;
        bool isSet;
    }

    struct Interaction {
        string interactionName;
        uint256 interactionDate;
        uint256 interactionHashValue;
        address interactionOwner;
        
        string name;
        uint256 date;
        uint256 hashValue;
        string comments;
        address owner;
        bool isSet;
    }

    mapping(uint256 => Document) public documentMapping;
    mapping(uint256 => Interaction) public interactionMapping;

    event documentEntry(string _name, uint256 _date, uint256 _hashValue, string _comments, address indexed _owner, bool _isSet);
    event interactionEntry(string _interactionName, uint256 _interactionDate, uint256 _interactionHashValue, address indexed _interactionOwner, string _name, uint256 _date, uint256 _hashValue, string _comments, address indexed _owner, bool _isSet);

    Document emptyDocument;

    constructor() public {
        documentCount = 1;
        interactionCount = 0;
        emptyAddress = address(0);
        emptyDocument = Document("", 0, 0, "", emptyAddress, false);
        messageSender = msg.sender;
    }

    function search(uint256 _hashValue) public view returns(uint256){
        for (uint i = 1; i < documentCount; i++) {
            Document storage document = documentMapping[i];
            if (document.isSet && document.hashValue == _hashValue) {
                return i;
            }
        }
        return 0;
    }

    function upload(string memory _name, uint256 _hashValue, string memory _comments) public {
        uint256 index = search(_hashValue);
        uint256 pos;
        updateStatus = false;
        Document memory document = Document(_name, block.timestamp, _hashValue, _comments, messageSender, true);

        if (index == 0) {
            pos = documentCount++;
        } else {
            pos = index;
            updateStatus = true;

            Interaction memory interaction = Interaction("update", block.timestamp, document.hashValue, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
            interactionMapping[interactionCount++] = interaction;
            emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionHashValue, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
        }

        documentMapping[pos] = document;
        emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
        currentDocumentDate = document.date;
        currentDocumentOwner = document.owner;
    }

    function check(uint256 _hashValue) public {
        uint256 index = search(_hashValue);
        Document memory document = emptyDocument;
        currentDocumentName = "";
        currentDocumentDate = 0;
        currentDocumentHashValue = 0;
        currentDocumentComments = "";
        currentDocumentOwner = emptyAddress;

        if (index != 0) {
            document = documentMapping[index];
            currentDocumentName = document.name;
            currentDocumentDate = document.date;
            currentDocumentHashValue = document.hashValue;
            currentDocumentComments = document.comments;
            currentDocumentOwner = document.owner;
        }

        Interaction memory interaction = Interaction("check", block.timestamp, _hashValue, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
        interactionMapping[interactionCount++] = interaction;
        emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionHashValue, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
    }

    function remove(uint256 _hashValue) public {
        uint256 index = search(_hashValue);
        Document memory document = emptyDocument;
        removeStatus = false;
        currentDocumentName = "";
        currentDocumentDate = 0;
        currentDocumentHashValue = 0;
        currentDocumentComments = "";
        currentDocumentOwner = emptyAddress;

        if (index != 0) {
            removeStatus = true;
            document = documentMapping[index];
            document.isSet = false;
            documentMapping[index] = document;
            emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
            currentDocumentName = document.name;
            currentDocumentDate = document.date;
            currentDocumentHashValue = document.hashValue;
            currentDocumentComments = document.comments;
            currentDocumentOwner = document.owner;
        }

        Interaction memory interaction = Interaction("remove", block.timestamp, _hashValue, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
        interactionMapping[interactionCount++] = interaction;
        emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionHashValue, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
    }

    function getDocument(uint256 pos) public view returns(string memory, uint256, uint256, string memory, address, bool) {
        Document storage document = documentMapping[pos];
        return (document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
    }

    function getInteraction(uint256 pos) public view returns(string memory, uint256, uint256, address, string memory, uint256, uint256, string memory, address, bool) {
        Interaction storage interaction = interactionMapping[pos];
        return (interaction.interactionName, interaction.interactionDate, interaction.interactionHashValue, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
    }

    function getDocumentCount() public view returns (uint256) {
        return documentCount;
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

    function getCurrentDocumentHashValue() public view returns (uint256) {
        return currentDocumentHashValue;
    }

    function getCurrentDocumentComments() public view returns (string memory) {
        return currentDocumentComments;
    }

    function getCurrentDocumentOwner() public view returns (address) {
        return currentDocumentOwner;
    }

    function getUpdateStatus() public view returns (bool) {
        return updateStatus;
    }

    function getRemoveStatus() public view returns (bool) {
        return removeStatus;
    }

    function getEmptyDocument() public view returns (string memory, uint256, uint256, string memory, address, bool) {
        return (emptyDocument.name, emptyDocument.date, emptyDocument.hashValue, emptyDocument.comments, emptyDocument.owner, emptyDocument.isSet);
    }

    function getMessageSender() public view returns (address) {
        return messageSender;
    }

    function getEmptyAddress() public view returns (address) {
        return emptyAddress;
    }
}