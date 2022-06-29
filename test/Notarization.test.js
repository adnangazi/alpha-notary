/**
* test the Smart Contract Notarization
*/
contract("NOTARIZATION", () => {
  /**
  * set the attributes needed for the tests
  */
  before(async () => {
    this.Notarization = artifacts.require('./Notarization.sol');
    this.documentName = "Documento";
    this.documentComments = "Commento del documento";
    this.documentHash = 999999;
  });

  /**
  * test the deploy to start the Smart Contract
  */
  it("DEPLOY", async () => {
    this.notarization = await this.Notarization.deployed();
    this.owner = await this.notarization.getCurrentInteractionOwner();
    assert.equal(await this.notarization.getInteractionCount(), 0);
  });

  /**
  * test the upload functionality
  */
  it("UPLOAD", async () => {
    // uploading a Document
    await this.notarization.upload(this.documentName, this.documentHash, this.documentComments, true);

    // testing the current Document information
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getUploadResult(), false);

    // testing the current Document Interaction
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());

    // testing the current Interaction
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

  /**
  * test the check functionality
  */
  it("CHECK", async () => {
    // check a Document
    await this.notarization.check(this.documentHash, false);

    // testing the current Document information
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getCheckResult(), true);
    
    // testing the current Interaction
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());
  });

  /**
  * test the remove functionality
  */
  it("REMOVE", async () => {
    // remove a Document
    await this.notarization.remove(this.documentHash, false);
    
    // testing the current Document information
    assert.equal(await this.notarization.getCurrentDocumentName(), this.documentName);
    var attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentDocumentDate()) <= Date.now());
    assert.equal(await this.notarization.getCurrentDocumentComments(), this.documentComments);
    assert.equal(await this.notarization.getCurrentDocumentOwner(), this.owner);
    assert.equal(await this.notarization.getRemoveResult(), true);
    
    // testing the current Interaction
    attualDate = new Date(0);
    assert(attualDate.setUTCSeconds(await this.notarization.getCurrentInteractionDate()) <= Date.now());
  });
});