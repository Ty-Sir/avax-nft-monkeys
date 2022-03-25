Moralis.Cloud.define("amountMinted", async (request) => {
  const query = new Moralis.Query("MonkeyMinted");
  query.equalTo("confirmed", true);
  const queryResults = await query.count();
	if(queryResults){
    return queryResults;
  }
});

Moralis.Cloud.define("amountChanged", async (request) => {
  const query = new Moralis.Query("OfferPriceChanged");
  query.equalTo("confirmed", true);
  const queryResults = await query.count();
	if(queryResults){
    return queryResults;
  }
});

Moralis.Cloud.define("amountRemoved", async (request) => {
  const query = new Moralis.Query("OfferRemoved");
  query.equalTo("confirmed", true);
  const queryResults = await query.count();
	if(queryResults){
    return queryResults;
  }
});

Moralis.Cloud.define("amountSet", async (request) => {
  const query = new Moralis.Query("OfferSet");
  query.equalTo("confirmed", true);
  const queryResults = await query.count();
	if(queryResults){
    return queryResults;
  }
});

Moralis.Cloud.define("amountSold", async (request) => {
  const query = new Moralis.Query("OfferSold");
  query.equalTo("confirmed", true);
  const queryResults = await query.count();
	if(queryResults){
    return queryResults;
  }
});