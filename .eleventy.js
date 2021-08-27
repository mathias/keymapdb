module.exports = function(eleventyConfig) {
  // Output directory: _site

  // Copy images, CSS styles, JS, and JSON files to built `_site/`
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("js");
};
