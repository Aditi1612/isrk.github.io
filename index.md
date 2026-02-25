---
layout: home
title: Home
---

<section class="hero">
  <div class="hero-inner">
    <img src="{{ '/assets/images/logos/isrk_logo_tri_color.png' | relative_url }}" alt="ISRK Logo" class="hero-logo">
    <span class="hero-badge">Est. May 2019 &nbsp;&#127470;&#127475; India &nbsp;&#10022;&nbsp; &#127472;&#127479; Korea</span>
    <h1>Indian Students &amp; Researchers in Korea</h1>
    <p>Your home away from home — academic support, career opportunities, cultural celebrations, and a community of 5,000+ Indians across 70+ Korean universities.</p>
    <div class="hero-btns">
      <a href="{{ '/about/' | relative_url }}" class="btn btn-primary">Discover ISRK</a>
      <a href="{{ '/notices/' | relative_url }}" class="btn btn-outline">Latest Notices</a>
      <button class="btn btn-green" onclick="toggleHeroSNS(this)" aria-expanded="false">Join Community</button>
    </div>
    <div class="hero-sns" id="hero-sns-panel" style="display:none;">
      <span class="hero-sns-label">Connect with us</span>
      <div class="hero-sns-icons">
        <a href="https://www.youtube.com/channel/UCVtezYzITvXCpl54UPPIJTQ/streams" target="_blank" class="hero-sns-icon youtube" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
        <a href="https://t.me/+U30rQW7o4KWYPExs" target="_blank" class="hero-sns-icon telegram" title="Telegram"><i class="fa-brands fa-telegram"></i></a>
        <a href="https://www.facebook.com/share/g/1Jev7ykSSE/" target="_blank" class="hero-sns-icon facebook" title="Facebook"><i class="fa-brands fa-facebook"></i></a>
        <a href="https://www.instagram.com/teamisrk?igsh=a2M0dmw1cWN4Nmtr" target="_blank" class="hero-sns-icon instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
        <a href="https://www.linkedin.com/groups/13929925/" target="_blank" class="hero-sns-icon linkedin" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
        <a href="mailto:isrk.association@gmail.com" class="hero-sns-icon email" title="Email"><i class="fa-solid fa-envelope"></i></a>
      </div>
    </div>
    <script>
      function toggleHeroSNS(btn) {
        var panel = document.getElementById('hero-sns-panel');
        var open = panel.style.display === 'none';
        panel.style.display = open ? 'flex' : 'none';
        btn.setAttribute('aria-expanded', open);
        btn.textContent = open ? 'Close ✕' : 'Join Community';
      }
    </script>
  </div>
</section>

<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item">
      <div class="stat-number">5<span>K+</span></div>
      <div class="stat-label">Members</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">70<span>+</span></div>
      <div class="stat-label">Universities</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">100<span>+</span></div>
      <div class="stat-label">Representatives</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">8<span>+</span></div>
      <div class="stat-label">MoU Partners</div>
    </div>
  </div>
</div>

<div class="section-alt">
<div class="section">
  <span class="section-label">What We Do</span>
  <h2 class="section-title">Supporting You at Every Step</h2>
  <p class="section-subtitle">ISRK is with you from the moment you land in Korea — through every academic milestone, cultural celebration, and career opportunity.</p>

  <div class="values-grid">
    <div class="value-card">
      <h3>&#127979; Education</h3>
      <p>Scholarships, workshops, mentorship programs, and academic guidance for students and researchers.</p>
    </div>
    <div class="value-card">
      <h3>&#129684; Culture</h3>
      <p>Diwali, Holi, Independence Day, food festivals — celebrating India's rich heritage in Korea.</p>
    </div>
    <div class="value-card">
      <h3>&#9917; Sports</h3>
      <p>Cricket, football, badminton, and more — staying active and connected through competitive sports.</p>
    </div>
    <div class="value-card">
      <h3>&#128188; Careers</h3>
      <p>Job postings, research opportunities, internships, and industry networking to grow your career.</p>
    </div>
  </div>
</div>
</div>

<div class="section">
  <span class="section-label">About ISRK</span>
  <h2 class="section-title">A Community Built on Unity</h2>
  <p>ISRK is a non-profit voluntary organization founded in <strong>May 2019</strong> to connect all Indian-origin students and researchers in South Korea. We provide educational, research, social, recreational, job, and community support — helping every member thrive in their new home.</p>
  <p>We have signed MoUs with <strong>KOINA, SPIC MACAY, SENTBE, RIST, UCC, ACN, Chakra Indian Restaurant</strong>, and the Honorary Consulate General of Korea in Hyderabad.</p>
  <a href="{{ '/about/' | relative_url }}" class="btn btn-primary" style="margin-top:0.5rem;">Read Our Story</a>
</div>

<div class="section-alt">
<div class="section">
  <span class="section-label">Introduction</span>
  <h2 class="section-title">Who We Are — Watch Our Story</h2>
  <p class="section-subtitle">Get to know ISRK — our journey, our community, and what we stand for.</p>
  <div class="video-grid video-grid-3">
    <div class="video-wrapper">
      <iframe src="https://www.youtube.com/embed/ww9_gg80R5s" title="ISRK Introduction" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <div class="video-wrapper">
      <iframe src="https://www.youtube.com/embed/l-YXSpT9GfI" title="ISRK Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
    <div class="video-wrapper">
      <iframe src="https://www.youtube.com/embed/A-7KrXU7k-M" title="ISRK Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>
  </div>
</div>
</div>

<div class="section-alt">
<div class="section">
  <span class="section-label">Our Partners</span>
  <h2 class="section-title">Supported By</h2>
  <div class="logo-grid">
    <div class="logo-item"><img src="{{ '/assets/images/logos/embassy-of-india.png' | relative_url }}" alt="Embassy of India"><span>Embassy of India</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/niied.png' | relative_url }}" alt="NIIED"><span>NIIED</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/svcc-embassy.png' | relative_url }}" alt="SVCC"><span>SVCC Embassy of India</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/spic-macay.png' | relative_url }}" alt="SPIC MACAY"><span>SPIC MACAY</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/merck.png' | relative_url }}" alt="Merck"><span>Merck</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/iik.png' | relative_url }}" alt="Indians in Korea"><span>Indians in Korea</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/seoul-global-center.png' | relative_url }}" alt="Seoul Global Center"><span>Seoul Global Center</span></div>
    <div class="logo-item"><img src="{{ '/assets/images/logos/hanpass.png' | relative_url }}" alt="Hanpass"><span>Hanpass</span></div>
  </div>
</div>
</div>

<div class="cta-banner">
  <h2>New to Korea? We've Got You.</h2>
  <p>From visa guidance to finding housing, banking, and connecting with fellow Indians — ISRK is your first stop.</p>
  <a href="{{ '/information/' | relative_url }}" class="btn btn-primary" style="margin-right:0.8rem;">Important Information</a>
  <a href="{{ '/sns/' | relative_url }}" class="btn btn-outline">Join Our Groups</a>
</div>
