const Notary = artifacts.require('./Notary.sol');
const emptyAddress = "0x0000000000000000000000000000000000000000";
const document1Name = "Documento1";
const document1Comments = "Commento del documento 1";
const document1Hash = 999;
const document2Name = "Documento2";
const document2Comments = "Commento del documento 2";
const document2Hash = 998;

contract("NOTARY", (accounts) => {
  before(async () => {
      this.notary = await Notary.deployed();
      this.owner = await this.notary.getMessageSender();
  });

  it("DEPLOY", async () => {
    assert.equal(await this.notary.getDocumentCount(), 1);
    assert.equal(await this.notary.getEmptyAddress(), emptyAddress);
    
    var emptyDocument = await this.notary.getEmptyDocument();
    assert.equal(emptyDocument[0], "");
    assert.equal(emptyDocument[1], 0);
    assert.equal(emptyDocument[2], 0);
    assert.equal(emptyDocument[3], "");
    assert.equal(emptyDocument[4].toString(), emptyAddress);
    assert.equal(emptyDocument[5], false);
    assert.equal(await this.notary.getMessageSender(), this.owner);
  });

  it("UPLOAD", async () => {
    await this.notary.upload(document1Name, document1Hash, document1Comments);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notary.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notary.getUpdateStatus(), false);
    assert.equal(await this.notary.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notary.getCurrentDocumentName(), document1Name);
    assert.equal(await this.notary.getCurrentDocumentComments(), document1Comments);
    assert.equal(await this.notary.getCurrentDocumentHashValue(), document1Hash);
    var doc = await this.notary.getDocument(await this.notary.getDocumentCount() - 1);
    assert.equal(doc[0], document1Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], document1Hash);
    assert.equal(doc[3], document1Comments);
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    await this.notary.upload(document2Name, document1Hash, document2Comments);
    assert.equal(await this.notary.getUpdateStatus(), true);
    assert.equal(await this.notary.getUpdateStatus(), true);
  });

  it("CHECK", async () => {
    await this.notary.check(document1Hash);
    var doc = await this.notary.getDocument(await this.notary.search(document1Hash));
    assert.equal(doc[0], document2Name);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(doc[1]) <= Date.now());
    assert.equal(doc[2], document1Hash);
    assert.equal(doc[3], document2Comments);
    assert.equal(doc[4], this.owner);
    assert.equal(doc[5], true);

    assert.equal(await this.notary.getCurrentDocumentName(), document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notary.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notary.getCurrentDocumentHashValue(), document1Hash);
    assert.equal(await this.notary.getCurrentDocumentComments(), document2Comments);
    assert.equal(await this.notary.getCurrentDocumentOwner(), this.owner);

    await this.notary.check(document2Hash);
    doc = await this.notary.getDocument(await this.notary.search(document2Hash));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notary.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notary.getCurrentDocumentDate()), 0);
    assert.equal(await this.notary.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notary.getCurrentDocumentComments(), "");
    assert.equal(await this.notary.getCurrentDocumentOwner(), emptyAddress);
  });

  it("REMOVE", async () => {
    await this.notary.remove(document1Hash);
    var doc = await this.notary.getDocument(await this.notary.search(document1Hash));
    assert.equal(doc[0], "");
    var attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notary.getCurrentDocumentName(), document2Name);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notary.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notary.getCurrentDocumentHashValue(), document1Hash);
    assert.equal(await this.notary.getCurrentDocumentComments(), document2Comments);
    assert.equal(await this.notary.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notary.getRemoveStatus(), true);

    await this.notary.remove(document2Hash);
    doc = await this.notary.getDocument(await this.notary.search(document2Hash));
    assert.equal(doc[0], "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(doc[1]), 0);
    assert.equal(doc[2], 0);
    assert.equal(doc[3], "");
    assert.equal(doc[4], emptyAddress);
    assert.equal(doc[5], false);

    assert.equal(await this.notary.getCurrentDocumentName(), "");
    attualDate = new Date(0);
    assert.equal(attualDate.setUTCSeconds(await this.notary.getCurrentDocumentDate()), 0);
    assert.equal(await this.notary.getCurrentDocumentHashValue(), 0);
    assert.equal(await this.notary.getCurrentDocumentComments(), "");
    assert.equal(await this.notary.getCurrentDocumentOwner(), emptyAddress);
    assert.equal(await this.notary.getRemoveStatus(), false);
  });
});