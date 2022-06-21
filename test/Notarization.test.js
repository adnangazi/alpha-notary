const Notarization = artifacts.require('./Notarization.sol');

contract("NOTARIZATION", (accounts) => {
  before(async () => {
      this.notarization = await Notarization.deployed();
      this.owner = await this.notarization.getMessageSender();
  });

  it("DEPLOY", async () => {
    assert.equal(await this.notarization.getDocumentCount(), 1);
    assert.equal(await this.notarization.getInteractionCount(), 0);
    assert.equal(await this.notarization.getEmptyAddress(), "0x0000000000000000000000000000000000000000");
    
    var emptyDocument = await this.notarization.getEmptyDocument();
    assert.equal(emptyDocument[0], "");
    assert.equal(emptyDocument[1], 0);
    assert.equal(emptyDocument[2], 0);
    assert.equal(emptyDocument[3], "");
    assert.equal(emptyDocument[4].toString(), "0x0000000000000000000000000000000000000000");
    assert.equal(emptyDocument[5], false);
    assert.equal(await this.notarization.getMessageSender(), this.owner);
  });

  it("UPLOAD", async () => {
    await this.notarization.upload("Documento1", 999, "Commento del documento 1");
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getUpdateStatus(), false);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    var doc = await this.notarization.getDocument(await this.notarization.getDocumentCount() - 1);
    assert.equal(doc[0], "Documento1");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], 999);
    assert.equal(doc[3], "Commento del documento 1");
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    await this.notarization.upload("Documento2", 999, "Commento del documento 2");
    assert.equal(await this.notarization.getUpdateStatus(), true);
    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(await this.notarization.getUpdateStatus(), true);
    assert.equal(interaction[0], "update");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);
  });

  it("CHECK", async () => {
    await this.notarization.check(999);
    var doc = await this.notarization.getDocument(await this.notarization.search(999));
    assert.equal(doc[0], "Documento2");
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], 999);
    assert.equal(doc[3], "Commento del documento 2");
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    assert.equal(await this.notarization.getCurrentDocumentName(), "Documento2");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 999);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "Commento del documento 2");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);

    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "check");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);

    await this.notarization.check(998);
    doc = await this.notarization.getDocument(await this.notarization.search(998));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], "0x0000000000000000000000000000000000000000");
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), "0x0000000000000000000000000000000000000000");
  });

  it("REMOVE", async () => {
    await this.notarization.remove(999);
    var doc = await this.notarization.getDocument(await this.notarization.search(999));
    assert.equal(doc[0], "");
    var attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], "0x0000000000000000000000000000000000000000");
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "Documento2");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 999);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "Commento del documento 2");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getRemoveStatus(), true);

    var interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "remove");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], false);

    await this.notarization.remove(998);
    doc = await this.notarization.getDocument(await this.notarization.search(998));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], "0x0000000000000000000000000000000000000000");
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), "0x0000000000000000000000000000000000000000");
    assert.equal(await this.notarization.getRemoveStatus(), false);
  });
});