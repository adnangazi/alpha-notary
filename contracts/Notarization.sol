// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.16;

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
    
    address private messageSender;

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
    event interactionEntry(string _interactionName, uint256 _interactionDate, address indexed _interactionOwner, string _name, uint256 _date, uint256 _hashValue, string _comments, address indexed _owner, bool _isSet);

    Document private emptyDocument;

    constructor() public {
        documentCount = 1;
        interactionCount = 0;
        emptyDocument = Document("", 0, 0, "", address(0), false);
        messageSender = msg.sender;
    }

    function search(uint256 _hashValue) private view returns(uint256) {
        Document storage document;
        for (uint i = 1; i < documentCount; i++) {
            document = documentMapping[i];
            if (document.isSet && document.hashValue == _hashValue) {
                return i;
            }
        }
        return 0;
    }

    function setDocument(Document memory document) private {
        currentDocumentName = document.name;
        currentDocumentDate = document.date;
        currentDocumentHashValue = document.hashValue;
        currentDocumentComments = document.comments;
        currentDocumentOwner = document.owner;
    }

    function upload(string memory _name, uint256 _hashValue, string memory _comments, bool lite) public {
        uint256 index = search(_hashValue);
        uint256 pos;
        updateStatus = false;
        Document memory document = Document(_name, block.timestamp, _hashValue, _comments, messageSender, true);

        if (index == 0) {
            pos = documentCount++;
        } else {
            pos = index;
            updateStatus = true;

            if (!lite) {
                Interaction memory interaction = Interaction("update", block.timestamp, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
                interactionMapping[interactionCount++] = interaction;
                emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
            }
        }

        setDocument(document);

        documentMapping[pos] = document;
        emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
    }

    function check(uint256 _hashValue, bool lite) public {
        uint256 index = search(_hashValue);
        Document memory document = emptyDocument;

        setDocument(emptyDocument);

        if (index != 0) {
            setDocument(documentMapping[index]);
        }

        if (!lite) {
            Interaction memory interaction = Interaction("check", block.timestamp, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
            interactionMapping[interactionCount++] = interaction;
            emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
        }
    }

    function remove(uint256 _hashValue, bool lite) public {
        uint256 index = search(_hashValue);
        Document memory document = emptyDocument;

        removeStatus = false;
        setDocument(emptyDocument);

        if (index != 0) {
            removeStatus = true;
            document = documentMapping[index];
            document.isSet = false;
            documentMapping[index] = document;

            setDocument(document);

            emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
        }

        if (!lite) {
            Interaction memory interaction = Interaction("remove", block.timestamp, messageSender, document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
            interactionMapping[interactionCount++] = interaction;
            emit interactionEntry(interaction.interactionName, interaction.interactionDate, interaction.interactionOwner, interaction.name, interaction.date, interaction.hashValue, interaction.comments, interaction.owner, interaction.isSet);
        }
    }

    function getDocumentByHashValue(uint256 _hashValue) public view returns(string memory, uint256, uint256, string memory, address, bool) {
        uint256 pos = search(_hashValue);
        Document storage document;
        if (pos != 0) {
            document = documentMapping[pos];
        } else {
            document = emptyDocument;
        }
        return (document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
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
}