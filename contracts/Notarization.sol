// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.16;

contract Notarization {
    uint256 private interactionCount;    
    address private messageSender;

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

    event documentEntry(string _name, uint256 _date string _comments, address indexed _owner, bool _isSet);
    event interactionEntry(string _name, uint256 _date, address indexed _owner, string _documentName, uint256 _documentDate, string _documentComments, address indexed _documentOwner, bool _documentIsSet);

    constructor() public {
        interactionCount = 0;
        messageSender = msg.sender;
    }    

    function getInteractionInfo(uint256 pos) public view returns (string memory, uint256, address, string memory, uint256, string memory, address, bool) {
        Interaction storage interaction = interactionMapping[pos];
        return (interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    function getInteractionCount() public view returns (uint256) {
        return interactionCount;
    }

    function createDocument(string memory _name, string memory _comments) private view returns (Document) {
        return Document(_name, block.timestamp, _comments, messageSender, true);
    }

    function emitDocument(Document memory document) private {
        emit documentEntry(document.name, document.date, document.comments, document.owner);
    }

    function createInteraction(string memory _name, uint256 _hashValue) private view returns (Interaction) {
        Document memory document = documentMapping[_hashValue];
        Interaction memory interaction = Interaction(_name, block.timestamp, messageSender, document.name, document.date, document.comments, document.owner, document.isSet);
    }

    function emitInteraction(Interaction memory interaction) private {
        emit interactionEntry(interaction.name, interaction.date, interaction.owner, interaction.documentName, interaction.documentDate, interaction.documentComments, interaction.documentOwner, interaction.documentIsSet);
    }

    function upload(string memory _name, uint256 _hashValue, string memory _comments, bool fullMode) public returns (uint256) {
        try {
            uint256 result;
            string memory resultName;
            bool setResult = documentMapping[_hashValue].isSet;

            if (setResult) {
                result = 2;
                resultName = "update";
            } else {
                result = 1;
                resultName = "upload";
            }

            if (fullMode) {
                Interaction memory interaction = createInteraction(resultName, _hashValue);
                interactionMapping[interactionCount++] = interaction;
                emitInteraction(interaction);
            }
            Document memory document = createDocument(_name, _comments);
            documentMapping[_hashValue] = document;
            emitDocument(document);
            return result;
        } catch {
            return 3;
        }
    }

    function check(uint256 _hashValue, bool fullMode) public returns (uint256) {
        try {
            if(fullMode) {
                Interaction memory interaction = createInteraction("check", _hashValue);
                interactionMapping[interactionCount++] = interaction;
                emitInteraction(interaction);
            }
            return documentMapping[_hashValue].isSet ? 1 : 2;
        } catch {
            return 3;
        }
    }
    
    function removeDocument(uint256 _hashValue) private {
        Document memory document = documentMapping[_hashValue];
        document.isSet = false;
        documentMapping[_hashValue] = document;
        emitDocument(document);
    }

    function remove(uint256 _hashValue, bool fullMode) public returns(uint256) {
        try {
            if(fullMode) {
                Interaction memory interaction = createInteraction("remove", _hashValue);
                interactionMapping[interactionCount++] = interaction;
                emitInteraction(interaction);
            }
            uint256 result = documentMapping[_hashValue].isSet ? 1 : 2;
            if (result == 1) {
                removeDocument(_hashValue);
            }
            return result;
        } catch {
            return 3;
        }
    }
}