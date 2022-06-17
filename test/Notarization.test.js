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
    
    const emptyDocument = await this.notarization.getEmptyDocument();
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
    const firstDate = new Date(0);
    assert(firstDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getUpdateStatus(), false);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    const doc = await this.notarization.getDocument(await this.notarization.getDocumentCount() - 1);
    assert.equal(doc[0], "Documento1");
    const secondDate = new Date(0);
    assert(secondDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], 999);
    assert.equal(doc[3], "Commento del documento 1");
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    await this.notarization.upload("Documento2", 999, "Commento del documento 2");
    assert.equal(await this.notarization.getUpdateStatus(), true);
    const interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(await this.notarization.getUpdateStatus(), true);
    assert.equal(interaction[0], "update");
    const thirdDate = new Date(0);
    assert(thirdDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    const fourthDate = new Date(0);
    assert(fourthDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);
  });

  it("CHECK", async () => {
    await this.notarization.check(999);
    const doc = await this.notarization.getDocument(await this.notarization.search(999));
    assert.equal(doc[0], "Documento2");
    const firstDate = new Date(0);
    assert(firstDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], 999);
    assert.equal(doc[3], "Commento del documento 2");
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    assert.equal(await this.notarization.getCurrentDocumentName(), "Documento2");
    const secondDate = new Date(0);
    assert(secondDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 999);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "Commento del documento 2");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);

    const interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "check");
    const thirdDate = new Date(0);
    assert(thirdDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    const fourthDate = new Date(0);
    assert(fourthDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], true);

    await this.notarization.check(998);
    const SecondDocument = await this.notarization.getDocument(await this.notarization.search(998));
    assert.equal(SecondDocument[0], "");
    const fifthDate = new Date(0);
    assert.equal(fifthDate.setUTCSeconds(SecondDocument[1]), 0);
    assert.equal(SecondDocument[2], 0);
    assert.equal(SecondDocument[3], "");
    assert.equal(SecondDocument[4], "0x0000000000000000000000000000000000000000");
    assert.equal(SecondDocument[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    const sixthDate = new Date(0);
    assert.equal(sixthDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), "0x0000000000000000000000000000000000000000");
  });

  it("REMOVE", async () => {
    await this.notarization.remove(999);
    const doc = await this.notarization.getDocument(await this.notarization.search(999));
    assert.equal(doc[0], "");
    const firstDate = new Date(0);
    assert.equal(firstDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], "0x0000000000000000000000000000000000000000");
    assert.equal(doc[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "Documento2");
    const secondDate = new Date(0);
    assert(secondDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 999);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "Commento del documento 2");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getRemoveStatus(), true);

    const interaction = await this.notarization.getInteraction(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "remove");
    const thirdDate = new Date(0);
    assert(thirdDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], 999);
    assert.equal(interaction[3], this.owner);
    assert.equal(interaction[4], "Documento2");
    const fourthDate = new Date(0);
    assert(fourthDate.setUTCSeconds(interaction[5]) <= Date.now());
    assert.equal(interaction[6], 999);
    assert.equal(interaction[7], "Commento del documento 2");
    assert.equal(interaction[8], this.owner);
    assert.equal(interaction[9], false);

    await this.notarization.remove(998);
    const SecondDocument = await this.notarization.getDocument(await this.notarization.search(998));
    assert.equal(SecondDocument[0], "");
    const fifthDate = new Date(0);
    assert.equal(fifthDate.setUTCSeconds(SecondDocument[1]), 0);
    assert.equal(SecondDocument[2], 0);
    assert.equal(SecondDocument[3], "");
    assert.equal(SecondDocument[4], "0x0000000000000000000000000000000000000000");
    assert.equal(SecondDocument[5], false);

    assert.equal(await this.notarization.getCurrentDocumentName(), "");
    const sixthDate = new Date(0);
    assert.equal(sixthDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()), 0);
    assert.equal(await this.notarization.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notarization.getCurrentDocumentComments(), "");
    assert.equal(await this.notarization.getCurrentDocumentOwner(), "0x0000000000000000000000000000000000000000");
    assert.equal(await this.notarization.getRemoveStatus(), false);
  });
});