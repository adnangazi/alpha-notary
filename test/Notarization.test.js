contract("NOTARIZATION", () => {
  before(async () => {
    this.Notarization = artifacts.require('./Notarization.sol');
    this.documentName = "Documento";
    this.documentComments = "Commento del documento";
    this.documentHash = 999999;
  });

  it("DEPLOY", async () => {
    this.notarization = await this.Notarization.deployed();
    this.owner = await this.notarization.getCurrentInteractionOwner();
    assert.equal(await this.notarization.getInteractionCount(), 0);
  });

  it("UPLOAD", async () => {
    await this.notarization.upload(this.documentName, this.documentHash, this.documentComments, true);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getUploadResult(), false);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());
    var interaction = await this.notarization.getInteractionInfo(await this.notarization.getInteractionCount() - 1);
    assert.equal(interaction[0], "Upload");
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[1]) <= Date.now());
    assert.equal(interaction[2], this.owner);
    assert.equal(interaction[3], this.documentName);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(interaction[4]) <= Date.now());
    assert.equal(interaction[5], this.documentComments);
    assert.equal(interaction[6], this.owner);
    assert.equal(interaction[7], true);
  });

  it("CHECK", async () => {
    await this.notarization.check(this.documentHash, false);
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getCheckResult(), true);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());
  });

  it("REMOVE", async () => {
    await this.notarization.remove(this.documentHash, false);
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getRemoveResult(), true);
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());
  });
});