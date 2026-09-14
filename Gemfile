source "https://rubygems.org"

gem "jekyll"
gem "webrick" # not bundled with Ruby 3+, needed by `jekyll serve`

group :jekyll_plugins do
  gem "jekyll-feed"    # /feed.xml
  gem "jekyll-sitemap" # /sitemap.xml
end

# al-folio runtime. This site overrides every layout, include and stylesheet it
# renders (see _layouts/, _includes/, _sass/), so the gem is here as the theme
# host rather than for its visual defaults.
gem "al_folio_core", "= 1.0.15"
