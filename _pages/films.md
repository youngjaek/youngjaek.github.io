---
layout: page
title: films
permalink: /films/
description: Frames I keep coming back to.
nav: false
---

{% if site.data.films and site.data.films.size > 0 %}

<div class="film-grid">
  {% for film in site.data.films %}
    <figure class="film-card">
      <img
        src="{{ film.image | prepend: '/assets/img/films/' | relative_url }}"
        alt="{{ film.title }}{% if film.year %} ({{ film.year }}){% endif %}"
        loading="lazy"
      >
      <figcaption>
        <span class="film-title">{{ film.title }}</span>
        {% if film.year %}<span class="film-year">{{ film.year }}</span>{% endif %}
        {% if film.director %}<span class="film-director">dir. {{ film.director }}</span>{% endif %}
        {% if film.note %}<span class="film-note">{{ film.note }}</span>{% endif %}
      </figcaption>
    </figure>
  {% endfor %}
</div>

{% else %}

<p>Nothing here yet. Screenshots are on the way.</p>

{% endif %}
