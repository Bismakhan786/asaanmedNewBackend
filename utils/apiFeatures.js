class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // search feature
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  // filter feature
  filter() {
    const queryCopy = { ...this.queryStr };

    // console.log(queryCopy)

    const removeFields = ["keyword", "page", "limit"];

    
    const category = queryCopy.cat;
    if(!category){
      removeFields.push('cat')
    }
    
    const status = queryCopy.status;
    if(!status){
      removeFields.push('status')
    }
    
    // remove extra words from search query string
    
    removeFields.forEach((key) => delete queryCopy[key]);

    const newQuery = Object.keys(queryCopy).length > 0 ? queryCopy : {} 
    // // for price filter
    // let queryStr = JSON.stringify(queryCopy);
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    // this.query = this.query.find(JSON.parse(queryStr));

    console.log(newQuery);

    this.query = this.query.find({...newQuery})
    return this;
  }
  // pagination
  pagination(resultPerPgae) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPgae * (currentPage - 1);

    this.query = this.query.limit(resultPerPgae).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
