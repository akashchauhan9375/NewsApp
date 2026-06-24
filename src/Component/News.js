import React, { useEffect, useState } from "react";
import Newsitem from "./Newsitem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = (props)=> {
  const[articles,setArticles] = useState([])
  const[loading,setLoading] = useState(true)
  const[page,setPage] = useState(1)
  const[totalResults,setTotalResults] = useState(0)
  

  const loadFallbackNews = async () => {
    const response = await fetch(`${process.env.PUBLIC_URL}/SampleOutput.json`);
    if (!response.ok) {
      throw new Error("Fallback news data could not be loaded");
    }

    return response.json();
  };

  const getNewsData = async (targetPage) => {
    const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=2c38aa8922024b25a99b7c9073bee123&page=${targetPage}&pageSize=${props.pageSize}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !Array.isArray(data.articles)) {
      return loadFallbackNews();
    }

    return data;
  };

  
  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  

  const updateNews = async()=> {
    try {
      props.setProgress(10)
      setLoading(true)
      const parsedData = await getNewsData(page);
      props.setProgress(70);
      setArticles(Array.isArray(parsedData.articles) ? parsedData.articles : [])
      setTotalResults(parsedData.totalResults || 0)
    } catch (error) {
      console.error("Unable to load news", error);
      setArticles([])
      setTotalResults(0)
    } finally {
      setLoading(false)
      props.setProgress(100)
    }
  }

  useEffect(()=>{
    document.title = `${capitalize(props.category)}- NewsMonkey`;
    updateNews();
  },[])

  

    // let url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=2c38aa8922024b25a99b7c9073bee123&pageSize=${props.pageSize}`;
    // setState({loading:true})
    // let data = await fetch(url);
    // let parsedData = await data.json()
    // console.log(parsedData);
    // this.setState({articles : parsedData.articles, totalArticles : parsedData.totalResults,loading:false})
  

  const handlePrevious = async () => {
    setPage(page-1)
    updateNews();
  };

  const handleNext = async () => {
    setPage(page+1)
    updateNews();

    
  };

  const fetchMoreData = async () => {
    let nextPage = page+1
    setPage(nextPage)

    try {
      let parsedData = await getNewsData(nextPage);
      setArticles(articles.concat(Array.isArray(parsedData.articles) ? parsedData.articles : []))
      setTotalResults(parsedData.totalResults || 0)
    } catch (error) {
      console.error("Unable to load more news", error);
    }

    
  };

 
    return (
      <>
        <h2 className="text-center" style={{marginTop:'90px'}}>
          Money News - Top {capitalize(props.category)} headlines
        </h2>
        
        {loading && <Spinner />}
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchMoreData}
          hasMore={articles.length < totalResults}
          loader={<Spinner />}
        >
          <div className="container">
            <div className="row">
              {articles.map((element) => {
                return (
                  <div className="col-md-4 mb-4" key={element.url}>
                    <Newsitem
                      title={
                        element.title
                          ? element.title.slice(0, 45)
                          : "No title available"
                      }
                      description={
                        element.description
                          ? element.description.slice(0, 88)
                          : "No description available"
                      }
                      imageUrl={element.urlToImage}
                      newsUrl={element.url}
                      author={element.author}
                      date={element.publishedAt}
                      source={element.source.name}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </InfiniteScroll>
      </>
    );
  
}

News.defaultProps = {
    country: "us",
    pageSize: 5,
    category: "general",
  };

  News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
  };

export default News;
