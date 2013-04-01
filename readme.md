#link-suppressor.js

##Introduction

A common request in [RapidWeaver](http://www.realmacsoftware.com/rapidweaver) is a method of disabling parent page links in a drop-down menu structure on a website, but still allowing those parent links to display subpages (in drop-downs) underneath. It is a practice often seen on many websites, although whether you need to use link suppression depends on the type of website you are building. 

Other publishing platforms like [Concrete5](http://concrete5.org) have supported forms of link suppression for years, via simple modifications to your auto-nav blocks in a theme. [Wordpress](http://wordpress.org) (as you would expect) has dozens of plugins available that do the same job. And for anyone building a website by-hand, then of course you have complete freedom to disable whatever page links you want in your navigation structures. 

In RapidWeaver, things are more difficult. RapidWeaver generates page navigation links automatically. RapidWeaver 4 and earlier used to let you type a **#** character in an offsite page style, and that page would then be disabled. So the page name would still show in a menu, but the page would not go anywhere when clicked. But something changed in newer versions of RapidWeaver, and now RapidWeaver prepends the website address onto any offsite page link not starting with 'http://' in the box. So pages which used to be disabled, have started going places they shouldn't!

The traditional method of disabling page links in new versions of RapidWeaver has been to (again) use offsite page styles in a project, but this time set the href to **nolink** or similar, in the RapidWeaver Page Inspector. Then use jQuery or some other Javascript code to traverse the navigation structure and modify all the 'nolink' links to something else. It's quick and it normally gets the job done. But there are a few hidden problems with this method:

1. It does not work if Javascript is turned off. There is no safety net in such instances and the link will remain live. The redirect will fail if you have not added a page named 'nolink' to your website.

2. Search engines like Google *really hate* this traditional method of disabling page links. You see, search engine spiders don't have Javascript support, so the supposedly disabled links still show up as live. When a search engine goes to one of the these links, they often get a 404. Some RapidWeaver users have seen their page ranks plummet after introducing link suppression. Not good.

3. Disabled links show up in places where they are not wanted, like block navigation layouts, breadcumbs and footer links. So you end up with an all-or-nothing type scenario. 

4. Traditional methods used for disabling page links don't appear to be compatible with some RapidWeaver addons like the [Armadillo Content Management System](http://www.nimblehost.com/store/armadillo/), by Nimblehost. Via Armadillio, you can't add a 'nolink' page, and I have been unable to find any other workaround solution this.


##Step forward link-suppressor.js

This is my own method of suppressing parent page links. The main focus is on graceful degradation, so if it fails, it does so gracefully and nothing nasty will happen. But I have also gone ahead and engineered this thing to work more efficiently and with greater flexibly. 

- Link-Suppressor is an add-and-forget solution. Theme developers or theme modifiers can add link suppressor JS into the main theme script.js file. The CSS code can be permanently added to the theme or setup as an optional theme style setting for theme customers to use (and allow a person to turn it on and off). 

- Control over exactly which levels of parent page links are suppressed. For example, you can suppress all first level parent page links, but keep the second level links functioning as standard.

- Link Suppressor works on touch devices (like the iPhone and iPad) and will not add anything that confuses or breaks the fragile touch events on these devices

- Works with the Armadillo CMS.

- No complicated code, configuration or settings for your theme users.

- A class is added to suppressed links, so that further enhancements can be made using CSS code; like disabling pointer cursors, changing colours, adjusting font size, styles, animations etc. Just about anything you can think of.

- Apply link suppression on some theme navigation structures (like drop-downs) but exclude others on the page like split, block, mobile, breadcrumb or footer navigation layouts.

The customisable on / off functionality which is provided to theme users is done using CSS, not Javascript. So if you are a RapidWeaver theme developer and you don't have theme settings in theme.plist calling Javascript files, there is a good chance you can move all your theme Javascript code to the end of the index.html file. Although this can sometimes break weaker RapidWeaver addons, there are huge performance gains to be had in moving your jQuery calls and Javascript files to the end of the page. Pages load visually faster and achieve better [speed test scores](https://developers.google.com/speed/pagespeed/).


##How does this thing work?

Simplicity is the key here. First we include the following jQuery Javascript code:

	$(document).ready(function () {
		$("#nav li:has(ul)").addClass('suppressedLink').prepend("<span class='linkSuppressor' onClick='return true'></span>");
	});

This fires on document ready (after all our page links are loaded) and looks in the #nav navigation structure for any list items with an unordered list (ul) underneath. Positive matches indicate that this is, indeed, a parent page with subpages. So ahead of suppressing the link, we then give it a class of **suppressedLink** (for CSS styling) and prepend an empty span tag into the list item (li).

At this point we have identified reliably which parent page links have subpages. Parent list items have been given the **.suppressedLink** class and an empty span tag. So simple CSS code can be used to finish the job:

	#nav ul li.suppressedLink span.linkSuppressor {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* Or use a fixed height in pixels */
		/* height: 52px; */
		z-index: 25;
		cursor: default;
		background: #ffffff;
		opacity: 0.01;
		-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0.01)";
		filter: alpha(opacity=0.01);
	}

All this CSS code does is to take our empty span tag and convert it into an invisible box layered over the link. So the link underneath is still active, but this 'skin' placed over the link stops it from being clicked. And it really is as simple as that! 


##Getting Link Suppressor working in a RapidWeaver theme

The first stage is to add the Javascript code to your existing themename-scripts.js file, or whatever file your theme uses to store jQuery code in for things like ExtraContent. The Javascript code is happy to go within an existing namespace or closure. So you may need to modify '$' to either 'jQuery' or '$themename'. Modify the selector name, so that the correct navigation structure in the page is being referenced. Existing jQuery code in the theme will give you a good indication of how Javascript is being handled. You can also omit the document ready handler and chain link suppressor into existing menu code if you prefer. There are loads of possible case examples for this Javascript code; and it fits snuggly into most setups.

The next step is the CSS code. This can go in the theme styles.css file, with existing navigation code. Again modify the selector name to match whatever the theme is already using. Or if you are a theme developer, the code can go in a separate stylesheet, and you can make your link suppressor an option theme style setting, via the theme.plist file. 

There are just a few important notes to remember when setting up Link Suppressor:

- The **onClick='return true'** code applied to the empty span tag is required to improve support on touch devices. It allows a finger tap on the screen to penetrate through the span tag and reveal a drop-down menu, but still resist allowing a disabled link from being clicked.

- A background and minimal opacity are required on the span tag via CSS, so that older web browsers render the empty span tag the same as newer web browsers do. Older versions of Internet Explorer treat an empty container with no background as 'display: none'. So applying the slightest hint of a background breaks this buggy behaviour. Although you could use a transparent GIF image as a background, that would be yet-another resource for the page to call, and I noticed some funky things happing in newer web browsers (like Chrome), relating to GIF's, text smoothing and CSS3 animations. So opacity seems like the best fix for now.

- The navigation list items require 'position: relative' applied to themselves, so the rendered link suppressor span tag sits within and comfortably fills the whole link. In a drop-down menu, this should be the case already. But it is worth mentioning nonetheless if a theme is handling navigation non-conventionally. 

- Make sure the anchor link tags are of a z-index value **less than** the link suppressor span, so that links will be correctly layered behind the spans.

- If using link suppressor in a block navigation layout, the span tag will require a fixed height (equal to the suppressed link). This will ensure that the span tag does not stretch and fill the entire list item block. This should not be a problem in navigation layouts like mobile toggle navigation boxes, as list items tend to already have a fixed height of 50px or thereabouts applied for touch devices.

##Browser Support

Link Suppressor has been heavily tested in the following web browsers:

- **Windows:** IE7, IE8, IE9 and IE8

- **Mac:** Safari 6, Firefox 18, Chrome 24, Opera 12

- **iPhone / iPad:** Safari, Chrome and Opera running on iOS 5 and iOS 6

- **Android:** Chrome, Firefox and Opera running on Android 4.2 (Ice Cream Sandwich)

##System requirements
Link Suppressor works in almost any RapidWeaver theme with jQuery Javascript support. So it's the same system requirements as other RapidWeaver plugins like [ExtraContent](http://foss.seydoggy.com/?p=ExtraContent).

##Download

The latest source code for Link Suppressor can be [downloaded from GitHub](https://github.com/willwood/link-suppressor.js). 

##License

Link Suppressor is now [MIT licensed](http://opensource.org/licenses/MIT), so you are totally free to download, use, customise, break, rebuild or resell Link Suppressor in any shape or form; both personal or commercial usage. If you do make use of link suppressor, a little subtle credit *somewhere* would be appreciated, but is not essential. ;-)

##Support

At this point in time, I can only provide free customer support in getting Link Suppressor setup in my own RapidWeaver themes. If you are a theme developer requiring help or an average RapidWeaver user curious to get this working in another theme, please contact me for a non-obligatory discussion about getting this setup for you.

##Bugs and feature requests

Please file and bugs or feature requests via [the Github page](https://github.com/willwood/link-suppressor.js) and provide all necessary information and details. That will make things far easier to track.