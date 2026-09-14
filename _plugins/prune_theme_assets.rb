# frozen_string_literal: true

# Drop gem-provided static assets that this site never references.
#
# Jekyll's ThemeAssetsReader copies everything under the theme's assets/
# directory into _site and, unlike the normal file reader, it does not consult
# `site.exclude`. For al_folio_core that is ~600 KB of Tailwind build, Jupyter
# and Pygments themes, and feature JS (search, math, typograms, masonry, tabs,
# tooltips) that no page here loads.
#
# Config:
#   prune_theme_assets: true              # drop all theme assets
#   keep_theme_assets: [assets/x.css]     # ...except these paths
#
# Source files always win: only files whose on-disk path is inside the theme
# root are considered, so local assets/css/main.css and assets/js/site.js are
# untouched even though they sit at the same relative paths.
Jekyll::Hooks.register :site, :post_read do |site|
  next unless site.config["prune_theme_assets"]

  theme_root = site.theme && site.theme.root
  next if theme_root.nil?

  keep = Array(site.config["keep_theme_assets"])
  before = site.static_files.size

  site.static_files.reject! do |file|
    next false unless file.path.to_s.start_with?(theme_root.to_s)

    relative = file.relative_path.to_s.sub(%r{\A/}, "")
    !keep.include?(relative)
  end

  pruned = before - site.static_files.size
  Jekyll.logger.info "Theme assets:", "pruned #{pruned} unreferenced file(s)" if pruned.positive?
end
