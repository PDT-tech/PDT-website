**Portland DayTime Singers**

Website Site Brief

*Draft --- March 2026*

**1. Project Overview**

Portland DayTime Singers (PDT Singers) is a men's barbershop-style
chorus based in Portland, Oregon. Founded by Chris Gable and Kevin Bier,
the group brings together men who love to sing during daytime hours,
with a mission of performing for seniors and residents of care
facilities throughout the greater Portland area.

This document defines the scope, structure, content, design direction,
and technical approach for the new pdtsingers.org website.

**2. Site Goals & Priorities**

The website serves five primary purposes, in order of launch priority:

- PRIORITY 1 --- Public awareness: promote performances and the group's
  mission to care facility audiences and the broader Portland community.

- PRIORITY 1 --- Recruitment: attract men who want to sing, explain what
  PDT Singers is, and make joining easy.

- Member portal: password-protected area for communications, leadership
  blogs, rehearsal notes, and resources.

- Friends of PDT Singers: a semi-public layer for supporters with links
  to social media presences.

- Group email: integrated with Google Workspace for Nonprofits (Google
  Groups) for mailing lists.

**3. Target Audiences**

  ---------------- --------------------------- ---------------------------
  **Audience**     **Who They Are**            **What They Need**

  Public Visitor   Care facility staff,        Who we are, upcoming
                   families, community members performances, how to book
                                               us

  Prospective      Men interested in joining a What membership looks like,
  Singer           men's chorus                rehearsal schedule, how to
                                               join

  Friend of PDT    Supporters, families, fans  News, announcements, social
                                               media links

  Member           Active PDT Singers members  Private comms, leadership
                                               blogs, rehearsal notes,
                                               resources

  Admin            Kevin Bier (Grand Poohbah), Manage members, post
                   Chris Gable, future         content, update schedule
                   co-maintainer               
  ---------------- --------------------------- ---------------------------

**4. Sitemap**

**4.1 Public Pages (No Login Required)**

  ------------------ ---------------------- -----------------------------
  **Page**           **URL**                **Key Content**

  Home               /                      Hero image, tagline, upcoming
                                            performances, join CTA, about
                                            teaser

  About Us           /about                 Mission, founding story,
                                            leadership bios, Duane's
                                            memorial

  Our Music          /music                 Barbershop tradition, song
                                            repertoire, video/audio clips

  Performances       /performances          Upcoming schedule, past
                                            highlights, booking inquiry
                                            form

  Join Us            /join                  Why join, what to expect,
                                            rehearsal info,
                                            contact/interest form

  Friends of PDT     /friends               Announcements, social media
                                            links, newsletter signup

  Contact            /contact               General contact form, email
                                            links
  ------------------ ---------------------- -----------------------------

**4.2 Member-Only Pages (Login Required)**

  ------------------ ---------------------- -----------------------------
  **Page**           **URL**                **Key Content**

  Member Home        /members               Dashboard, recent posts,
                                            quick links

  Leadership Blog    /members/blog          Posts from Chris, Kevin, and
                                            other leaders

  Communications     /members/comms         Announcements, meeting notes

  Resources          /members/resources     Sheet music, recordings,
                                            rehearsal schedules

  Login / Register   /login                 Email-based login; new
                                            accounts require admin
                                            approval
  ------------------ ---------------------- -----------------------------

**5. Brand & Visual Identity**

  ------------------ ----------------------------------------------------
  **Logo**           Existing logo: Portland skyline + Mt. Hood + Pacific
                     Northwest evergreens with watercolor wash. Use
                     consistently across all pages.

  **Tone**           Community-focused & heartfelt. Warm, welcoming,
                     accessible to all ages. Not corporate. Not overly
                     formal.

  **Primary Colors** Soft blue-grey watercolor wash (#A8C4D4 approx),
                     deep forest black (#1A1A1A), clean white (#FFFFFF)

  **Accent Color**   Warm gold or muted green drawn from Mt. Hood/forest
                     palette --- TBD after logo analysis

  **Typography**     Display: handwritten or humanist serif (echoing the
                     logo's informal lettering). Body: readable serif or
                     soft sans-serif.

  **Photography**    Real photos of the group performing. Authentic
                     moments. Warm lighting preferred.

  **Voice**          First person plural ("we sing", "come sing with
                     us"). Inclusive, encouraging, never exclusive or
                     jargon-heavy.
  ------------------ ----------------------------------------------------

**6. Technical Architecture**

**6.1 Recommended Stack**

  ------------------ ---------------------- -----------------------------
  **Layer**          **Choice**             **Rationale**

  Frontend           HTML/CSS/JS (static)   Simple to maintain, fast, no
                                            framework lock-in

  Hosting            Netlify (free tier)    Free SSL, drag-and-drop
                                            deploys, easy for
                                            non-technical maintainer

  Domain             pdtsingers.org         Already owned --- point DNS
                     (existing)             to Netlify

  Auth & DB          Supabase (free tier)   Member login, admin approval
                                            workflow, blog/post storage

  Email / Groups     Google Workspace for   Free for 501(c)(3) orgs ---
                     Nonprofits             apply ASAP, takes 2--4 weeks

  CMS (optional)     Decap CMS (free)       Lets non-technical admin post
                                            blogs without touching code

  Forms              Netlify Forms          Built-in, free, no backend
                                            needed for contact/join forms
  ------------------ ---------------------- -----------------------------

**6.2 Authentication Flow**

- New member submits interest form on /join page

- Admin (Kevin / Grand Poohbah) receives email notification

- Admin approves in Supabase dashboard --- user receives login link by
  email

- Approved member logs in via magic link (no password to forget)

- Member sees /members area; unapproved visitors see a "Pending
  approval" message

**7. Content Inventory**

**7.1 Content We Have**

- Logo files (color and B&W variants)

- Photos of the group

- Leadership names, titles, and bios (provided in brief)

- Performance history (first performance February 2026)

**7.2 Content to Create**

- Home page hero copy and tagline

- About Us narrative --- founding story, mission, Duane's remembrance

- Leadership bios (expanded, photo-ready)

- Join Us page --- what to expect, rehearsal details, FAQ

- Performances page --- schedule format, booking inquiry copy

- Friends of PDT --- define what a "Friend" is and what they receive

- Member portal initial posts from Chris and Kevin

**7.3 Content Decisions --- Resolved**

- Rehearsals: Mondays 10:30am--12:30pm, 13420 SW Butner Rd, Beaverton OR
  97005

- Voice placement only (no audition) --- sing Happy Birthday in your
  comfortable range

- Social media: Facebook (primary) and Instagram at launch; YouTube in
  Phase 2 once regular performances are established

- Tagline: "Music, Fellowship & Fun" --- the WBQA society tagline,
  featured on the logo

- Sheet music & learning tracks: currently on Dropbox, linked from
  Members portal. Will migrate to Google Workspace once nonprofit status
  and Workspace account are established.

- Duane Lundsten memorial: decision deferred pending group discussion
  --- placeholder space reserved in site design

**8. Leadership & About Content**

**Chris Gable --- Director & Co-Founder**

Chris has been active in the barbershop world since the 1990s and has
sung in multiple award-winning quartets. He previously directed the
Tualatin Valley Harmony Masters in Hillsboro, OR. Chris had the original
vision for a daytime chorus and is the founding director of PDT Singers.

**Kevin Bier --- Grand Poohbah (Admin Director) & Co-Founder**

Kevin began his barbershop journey in Boise, Idaho in 1980. He has
directed choruses in Boise and Boulder, CO, and was on the founding team
for the Denver Tech Chorus. He and Chris most recently sang together in
the quartet 7th Heaven for nine years. Kevin handles administration and
serves as assistant director.

**Other Leadership**

  ------------------ ------------------ ---------------------------------
  **Name**           **Title**          **Role**

  Grant Gibson       Nearly-Grand       Leadership support
                     Poohbah            

  Sam Vigil          Poohbah-at-Large   Marketing

  Ray Heller         Poohbah-at-Large   Chorus contact / outreach

  *Duane Lundsten †* Poohbah of Complex In memoriam --- our tech guy,
                     Stuff              passed March 2026
  ------------------ ------------------ ---------------------------------

**9. Organizational Affiliation --- WBQA**

Portland DayTime Singers is a proud member of the Worldwide Barbershop
Quartet Association (WBQA), awarded Lodge #18 at the WBQA Annual
Convention in San Antonio, Texas (2026). Chris Gable and Kevin Bier
attended in person to receive the charter.

PDT Singers is NOT affiliated with the Barbershop Harmony Society (BHS).
This distinction should be stated clearly on the About page to avoid
confusion, as BHS is the more widely recognized organization and some
visitors may assume a connection.

**WBQA Logo Placement on Site**

- Footer --- persistent badge on all pages alongside PDT logo

- About Us page --- dedicated callout: "Proud Lodge #18 of the Worldwide
  Barbershop Quartet Association, chartered at the 2026 San Antonio
  Convention"

- Join Us page --- credibility signal: PDT Singers connects you to a
  worldwide barbershop community

Logo file available: WBQA_logo.avif (424×434px, RGBA, black on
transparent --- works on any background).

**10. Suggested Build Plan**

**Phase 1 --- Foundation (Weeks 1--2)**

- Set up Netlify hosting and connect pdtsingers.org domain

- Apply for Google Workspace for Nonprofits

- Set up Supabase project for auth

- Design system: colors, fonts, components from logo

- Build Home, About, and Join Us pages

**Phase 2 --- Public Site Complete (Weeks 3--4)**

- Build Performances, Music, Friends, and Contact pages

- Integrate Netlify Forms for contact and join interest

- Upload photos, finalize all public copy

- SEO basics: meta tags, sitemap, Google Search Console

**Phase 3 --- Member Portal (Weeks 5--6)**

- Implement Supabase auth: login, registration, admin approval flow

- Build /members dashboard, blog, comms, and resources pages

- Test end-to-end: new member applies → admin approves → member logs in

**Phase 4 --- Handover & Training**

- Document how to: post a blog, add a member, update the schedule

- Onboard second maintainer

- Connect social media accounts to Friends page

**11. Open Questions & Next Steps**

The following have been RESOLVED:

- Rehearsal details: Mondays 10:30am--12:30pm, 13420 SW Butner Rd,
  Beaverton OR 97005 (Westside United Methodist / Westside Journey UMC)

- Voice placement (not an audition): prospective members sing Happy
  Birthday in their comfortable range. Directors use this to determine
  voice part. All men who love to sing are welcome.

- WBQA affiliation confirmed: Lodge #18, chartered at 2026 San Antonio
  Convention

- BHS relationship: not affiliated, but warm collegial relationship with
  BHS members and choruses

- Social media: Facebook (primary) + Instagram at launch; YouTube
  deferred to Phase 2

- Tagline: "Music, Fellowship & Fun" (WBQA society tagline)

- Sheet music/resources: Dropbox now, migrate to Google Workspace once
  nonprofit approval letter received

One item still pending:

- Duane Lundsten memorial --- form and placement TBD pending group
  discussion. Design will reserve a placeholder. NO action needed before
  Phase 1 build begins.

One item blocked on external dependency:

- Google Workspace for Nonprofits --- awaiting IRS nonprofit approval
  letter (expected imminently at Chris's address). Application cannot be
  submitted until letter is in hand. Does not block Phase 1 or Phase 2
  site build.

**Portland DayTime Singers**

*pdtsingers.org • Portland, Oregon*
