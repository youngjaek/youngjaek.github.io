---
layout: about
title: about
permalink: /
subtitle:

selected_papers: false
social: false

announcements:
  enabled: false

latest_posts:
  enabled: false
---

<div class="home-modern">
  <aside class="home-profile">
    <div class="profile-monogram" aria-hidden="true">YK</div>
    <p class="eyebrow">Computer Science + Mathematics</p>
    <h1>Youngjae Kim</h1>
    <p class="profile-school">University of Maryland<br>Graduating May 2027</p>

    <nav class="profile-links" aria-label="Contact links">
      <a href="mailto:alexykim02@gmail.com"><i class="fa-regular fa-envelope" aria-hidden="true"></i> Email</a>
      <a href="https://github.com/youngjaek"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub</a>
      <a href="https://www.linkedin.com/in/ykim02"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i> LinkedIn</a>
      <a href="{{ '/assets/pdf/Youngjae_Kim_Resume.pdf' | relative_url }}"><i class="fa-regular fa-file-lines" aria-hidden="true"></i> Résumé</a>
    </nav>

  </aside>

  <div class="home-content">
    <section class="home-intro" aria-labelledby="intro-title">
      <p class="section-kicker">About</p>
      <h2 id="intro-title">Backend systems, cloud infrastructure, and applied AI.</h2>
      <p>
        I’m currently a software engineering intern at Easy Dynamics. After graduating in May 2027, I plan to work as a software engineer.
      </p>
    </section>

    <section class="selected-work" aria-labelledby="work-title">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Selected work</p>
          <h2 id="work-title">A few problems I’ve worked on</h2>
        </div>
        <a class="text-link" href="{{ '/resume/' | relative_url }}">Full résumé <span aria-hidden="true">→</span></a>
      </div>

      <div class="work-list">
        <article class="work-card">
          <div class="work-meta">
            <span>Easy Dynamics</span>
            <time>2026—present</time>
          </div>
          <div>
            <h3>Cloud infrastructure that catches mistakes early</h3>
            <p>Multi-region Azure foundations in Terraform, with automated releases and validation for networking and federal compliance requirements.</p>
            <ul class="tag-list" aria-label="Technologies">
              <li>Terraform</li>
              <li>Azure</li>
              <li>GitHub Actions</li>
            </ul>
          </div>
        </article>

        <article class="work-card">
          <div class="work-meta">
            <span>Mindgrasp</span>
            <time>2025—2026</time>
          </div>
          <div>
            <h3>Support drafting with less rework</h3>
            <p>A retrieval and agent workflow that reduced manual editing time by 28% across roughly 60 customer-support drafts per week.</p>
            <ul class="tag-list" aria-label="Technologies">
              <li>Retrieval</li>
              <li>Agents</li>
              <li>Python</li>
            </ul>
          </div>
        </article>

        <article class="work-card">
          <div class="work-meta">
            <span>EchoIT</span>
            <time>2023—2025</time>
          </div>
          <div>
            <h3>Faster APIs through deliberate caching</h3>
            <p>A Redis cache-aside layer that brought P95 API latency down from 200 ms to under 30 ms.</p>
            <ul class="tag-list" aria-label="Technologies">
              <li>Java</li>
              <li>Spring Boot</li>
              <li>Redis</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="writing-card" aria-labelledby="writing-title">
      <div>
        <p class="section-kicker">Writing</p>
        <h2 id="writing-title">Notes from things I’m learning and building.</h2>
        <p>Short writing on software engineering, systems, and tools—when there’s something worth sharing.</p>
      </div>
      <a class="writing-link" href="{{ '/blog/' | relative_url }}">Read the blog <span aria-hidden="true">→</span></a>
    </section>

  </div>
</div>
