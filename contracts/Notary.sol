// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.16;

contract Notary {
    uint256 documentCount;

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

    mapping(uint256 => Document) public documentMapping;

    event documentEntry(string _name, uint256 _date, uint256 _hashValue, string _comments, address indexed _owner, bool _isSet);

    Document emptyDocument;

    constructor() public {
        documentCount = 1;
        emptyAddress = address(0);
        emptyDocument = Document("", 0, 0, "", emptyAddress, false);
        messageSender = msg.sender;
    }

    function search(uint256 _hashValue) public view returns(uint256){
        Document storage document = emptyDocument;
        for (uint i = 1; i < documentCount; i++) {
            document = documentMapping[i];
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
        }

        currentDocumentDate = document.date;
        currentDocumentOwner = document.owner;
        currentDocumentName = document.name;
        currentDocumentComments = document.comments;
        currentDocumentHashValue = document.hashValue;

        documentMapping[pos] = document;
        emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
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

            currentDocumentName = document.name;
            currentDocumentDate = document.date;
            currentDocumentHashValue = document.hashValue;
            currentDocumentComments = document.comments;
            currentDocumentOwner = document.owner;

            emit documentEntry(document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
        }
    }

    function getDocument(uint256 pos) public view returns(string memory, uint256, uint256, string memory, address, bool) {
        Document storage document = documentMapping[pos];
        return (document.name, document.date, document.hashValue, document.comments, document.owner, document.isSet);
    }

    function getDocumentCount() public view returns (uint256) {
        return documentCount;
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