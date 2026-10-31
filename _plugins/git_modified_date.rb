# frozen_string_literal: true

require 'open3'
require 'time'

# Set each post's last_modified_at from the last Git commit that touched its
# source file. This runs before Jekyll generators (including jekyll-sitemap).
# No source Markdown files or Git history are changed.
module GitModifiedDate
  def self.apply(site)
    root = File.expand_path(site.source)
    site.posts.docs.each do |post|
      # Respect a date deliberately set in the post's front matter.
      next if post.data.key?('last_modified_at') && post.data['last_modified_at']

      absolute_path = File.expand_path(post.path, root)
      relative_path = absolute_path.delete_prefix(root + File::SEPARATOR)
      unless absolute_path.start_with?(root + File::SEPARATOR)
        Jekyll.logger.warn('Git modified date:', "skipping path outside site: #{post.path}")
        next
      end

      stdout, stderr, status = Open3.capture3(
        'git', '-C', root, 'log', '-1', '--follow', '--format=%cI', '--', relative_path
      )

      if status.success? && !stdout.strip.empty?
        post.data['last_modified_at'] = Time.iso8601(stdout.strip)
      else
        # A missing Git commit (e.g., an untracked draft) should never become
        # today's date merely because a fresh Actions runner checked it out.
        post.data['last_modified_at'] = post.date
        Jekyll.logger.warn('Git modified date:',
                           "using publication date for #{relative_path}: #{stderr.strip}")
      end
    rescue ArgumentError => error
      post.data['last_modified_at'] = post.date
      Jekyll.logger.warn('Git modified date:', "invalid Git date for #{post.path}: #{error.message}")
    end
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  GitModifiedDate.apply(site)
end

Jekyll::Hooks.register :pages, :post_init do |page|
  next if page.data['last_modified_at']

  root = File.expand_path(page.site.source)
  next unless page.path && File.file?(File.expand_path(page.path, root))

  git_date, status = Open3.capture2(
    'git', '-C', root, 'log', '-1', '--format=%cI',
    '--', page.path
  )

  if status.success? && !git_date.strip.empty?
    page.data['last_modified_at'] = Time.iso8601(git_date.strip)
  end
end