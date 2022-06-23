const Notarization = artifacts.require('./Notarization.sol');
const emptyAddress = "0x0000000000000000000000000000000000000000";
const document1Name = "Documento1";
const document1Comments = "Commento del documento 1";
const document1Hash = 999;
const document2Name = "Documento2";
const document2Comments = "Commento del documento 2";
const document2Hash = 998;

contract("NOTARIZATION", (accounts) => {
  before(async () => {
      this.notarization = await Notarization.deployed();
      this.owner = await this.notarization.getMessageSender();
  });

  it("DEPLOY", async () => {
    assert.equal(await this.notarization.getDocumentCount(), 1);
    assert.equal(await this.notarization.getInteractionCount(), 0);
    assert.equal(await this.notarization.getEmptyAddress(), emptyAddress);
    
    var emptyDocument = await this.notarization.getEmptyDocument();
    assert.equal(emptyDocument[0], "");
    assert.equal(emptyDocument[1], 0);
    assert.equal(emptyDocument[2], 0);
    assert.equal(emptyDocument[3], "");
    assert.equal(emptyDocument[4].toString(), emptyAddress);
    assert.equal(emptyDocument[5], false);
    assert.equal(await this.notarization.getMessageSender(), this.owner);
  });

  it("UPLOAD", async () => {
    await this.notarization.upload(document1Name, document1Hash, document1Comments);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getUpdateStatus(), false);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getCurrentDocumentName(), document1Name);
    assert.equal(await this.notarization.getCurrentDocumentComments(), document1Comments);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), document1Hash);
    var doc = await this.notarization.getDocument(await this.notarization.getDocumentCount() - 1);
    assert.equal(doc[0], document1Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], document1Hash);
    assert.equal(doc[3], document1Comments);
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    await this.notarization.upload(document2Name, document1Hash, document2Comments);
    assert.equal(await this.notarization.getUpdateStatus(), true);
    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(await this.notarization.getUpdateStatus(), true);
    assert.equal(interaction[0], "update");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], document1Hash);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], document1Hash);
    assert.equal(interaction[7], document2Comments);
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);
  });

  it("CHECK", async () => {
    await this.notarization.check(document1Hash);
    var doc = await this.notarization.getDocument(await this.notarization.search(document1Hash));
    assert.equal(doc[0], document2Name);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], document1Hash);
    assert.equal(doc[3], document2Comments);
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    assert.equal(await this.notarization.getCurrentDocumentName(), document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), document1Hash);
    assert.equal(await this.notarization.getCurrentDocumentComments(), document2Comments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);

    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "check");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], document1Hash);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], document1Hash);
    assert.equal(interaction[7], document2Comments);
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);

    await this.notarization.check(document2Hash);
    doc = await this.notarization.getDocument(await this.notarization.search(document2Hash));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), emptyAddress);
  });

  it("REMOVE", async () => {
    await this.notarization.remove(document1Hash);
    var doc = await this.notarization.getDocument(await this.notarization.search(document1Hash));
    assert.equal(doc[0], "");
    var attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), document1Hash);
    assert.equal(await this.notarization.getCurrentDocumentComments(), document2Comments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getRemoveStatus(), true);

    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "remove");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], document1Hash);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], document1Hash);
    assert.equal(interaction[7], document2Comments);
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], false);

    await this.notarization.remove(document2Hash);
    doc = await this.notarization.getDocument(await this.notarization.search(document2Hash));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), emptyAddress);
    assert.equal(await this.notarization.getRemoveStatus(), false);
  });
});