/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "d13cfb2427dfabe2ba598f32687afc79"
  },
  {
    "url": "algorithm.html",
    "revision": "67c9b4e2c7a16a61005ec2750b580b31"
  },
  {
    "url": "assets/css/0.styles.6f654f53.css",
    "revision": "87a6028fb2307c657a10a8f596a75d87"
  },
  {
    "url": "assets/fonts/KaTeX_AMS-Regular.3d8245dc.woff2",
    "revision": "3d8245dcb4489694a6a263b05c1cca01"
  },
  {
    "url": "assets/fonts/KaTeX_AMS-Regular.ac1d46d9.woff",
    "revision": "ac1d46d953d403677171697581a284d2"
  },
  {
    "url": "assets/fonts/KaTeX_AMS-Regular.c67be87a.ttf",
    "revision": "c67be87adba7d31c013be127b936233d"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Bold.3f61a84d.ttf",
    "revision": "3f61a84d76e80396489d32bc9dd8d444"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Bold.445f96a3.woff",
    "revision": "445f96a387df0d13ded71f27c608516d"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Bold.970d3e76.woff2",
    "revision": "970d3e76493b82fccf21ad5888ddee77"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Regular.0ef0f2e3.woff2",
    "revision": "0ef0f2e356a2e1c457b6585d34edae77"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Regular.74f6918c.woff",
    "revision": "74f6918c7d2b768ffd32048102bc0172"
  },
  {
    "url": "assets/fonts/KaTeX_Caligraphic-Regular.c3bc8fce.ttf",
    "revision": "c3bc8fcec0e85a50cabf71e4e8074991"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Bold.1aca7ef7.woff",
    "revision": "1aca7ef7f976fb54a207ffc8aa180e38"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Bold.950649ba.woff2",
    "revision": "950649ba5e5cfd37cdad74095411d350"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Bold.e11e6bf0.ttf",
    "revision": "e11e6bf02fc41279a540d3655abf3b07"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Regular.135ccd74.woff2",
    "revision": "135ccd74931753318f6f52f3fce19018"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Regular.a9509497.ttf",
    "revision": "a9509497466d16e6b7265a223ea39093"
  },
  {
    "url": "assets/fonts/KaTeX_Fraktur-Regular.c5b430bf.woff",
    "revision": "c5b430bfcb3e5423b77401afcdb69b66"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Bold.0ba875a1.woff",
    "revision": "0ba875a1d548ebfdd00c7594022e01b7"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Bold.aaaa1b76.ttf",
    "revision": "aaaa1b761b7cc9d5e10b85f30731b878"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Bold.c5b67fb3.woff2",
    "revision": "c5b67fb3f6bdaa7f2dd75e5bc8d929eb"
  },
  {
    "url": "assets/fonts/KaTeX_Main-BoldItalic.0719833c.woff2",
    "revision": "0719833c23aeba83786a29e84a165875"
  },
  {
    "url": "assets/fonts/KaTeX_Main-BoldItalic.5aeca883.woff",
    "revision": "5aeca883bc41b522fdf1409ee912b51c"
  },
  {
    "url": "assets/fonts/KaTeX_Main-BoldItalic.bdbadb27.ttf",
    "revision": "bdbadb27e05fb8e51da903db59f90d77"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Italic.2155d789.ttf",
    "revision": "2155d7897af94033a6b6ed44133b867e"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Italic.6bf61628.woff2",
    "revision": "6bf616283a81e40e4ac755883862b472"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Italic.bb7c45db.woff",
    "revision": "bb7c45db8908c8fb88a293895a64e018"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Regular.1fd21713.woff",
    "revision": "1fd21713706a2b70960faf21b1fa4e26"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Regular.29b27903.woff2",
    "revision": "29b27903a08a71f8171be21ba413d4dd"
  },
  {
    "url": "assets/fonts/KaTeX_Main-Regular.7b8d1fa0.ttf",
    "revision": "7b8d1fa0668e317c4a2d34399e74af25"
  },
  {
    "url": "assets/fonts/KaTeX_Math-Italic.10740d74.ttf",
    "revision": "10740d7488d690a743339650103f1cb3"
  },
  {
    "url": "assets/fonts/KaTeX_Math-Italic.7a31741a.woff2",
    "revision": "7a31741a44e58952cb4b8a763c206fcd"
  },
  {
    "url": "assets/fonts/KaTeX_Math-Italic.8eb56b3f.woff",
    "revision": "8eb56b3ff5b141cd3732a24e65c2b339"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Bold.84299b01.woff",
    "revision": "84299b016163b0ae5c776604aa1cb726"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Bold.9123667c.ttf",
    "revision": "9123667cef81279761df5cd62ec8c46e"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Bold.e38d0f68.woff2",
    "revision": "e38d0f6844b9520510715fd989bdd5bd"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Italic.1057b702.woff2",
    "revision": "1057b70228cb6936e7714e7817db6ce2"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Italic.95c5a3d4.woff",
    "revision": "95c5a3d43efbcb8c14184d00a7c5eed4"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Italic.f9c440ab.ttf",
    "revision": "f9c440abdd25c5a954d855516fed39f9"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Regular.2eae604d.ttf",
    "revision": "2eae604dbbc4b2c0ceede62c61c9e8df"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Regular.35bda414.woff",
    "revision": "35bda414c6c2f75940b086de18f42e72"
  },
  {
    "url": "assets/fonts/KaTeX_SansSerif-Regular.f9e06d59.woff2",
    "revision": "f9e06d59e70de05c5f0b7f7f65c14565"
  },
  {
    "url": "assets/fonts/KaTeX_Script-Regular.60febfa1.woff",
    "revision": "60febfa114c5e32f0ce73050476aa39f"
  },
  {
    "url": "assets/fonts/KaTeX_Script-Regular.ae1fad1f.woff2",
    "revision": "ae1fad1f4d1c227c9d567da8ea9f988c"
  },
  {
    "url": "assets/fonts/KaTeX_Script-Regular.e9169ca7.ttf",
    "revision": "e9169ca7b32608b6235ec9ffff742a71"
  },
  {
    "url": "assets/fonts/KaTeX_Size1-Regular.f2e296ef.ttf",
    "revision": "f2e296ef7cef0f6f16912e5d171929b2"
  },
  {
    "url": "assets/fonts/KaTeX_Size2-Regular.0767ede6.ttf",
    "revision": "0767ede65042583bcc06f09055f4d7ca"
  },
  {
    "url": "assets/fonts/KaTeX_Size4-Regular.27901d5c.ttf",
    "revision": "27901d5ce93d8971c416d9123fedb911"
  },
  {
    "url": "assets/fonts/KaTeX_Typewriter-Regular.6b9645af.ttf",
    "revision": "6b9645af6e119fd5d85f24e21044ed03"
  },
  {
    "url": "assets/fonts/KaTeX_Typewriter-Regular.ba01f72a.woff",
    "revision": "ba01f72a8db89265149f3f712dc7f9a3"
  },
  {
    "url": "assets/fonts/KaTeX_Typewriter-Regular.f43e8696.woff2",
    "revision": "f43e86963e9cfda37bb2e958ddedcaad"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/img/wood.a1a33080.png",
    "revision": "a1a33080cfc1d6ebb9f1f72f1d667c60"
  },
  {
    "url": "assets/js/1.6b0ff513.js",
    "revision": "10195a5b8471a2a0fcf7f5456e3c6c13"
  },
  {
    "url": "assets/js/2.18964a90.js",
    "revision": "b12d3b71c3c164482dd2bc42f1c7d1b5"
  },
  {
    "url": "assets/js/3.3e282546.js",
    "revision": "1f732abbbf0b24209a91d78e54cf2193"
  },
  {
    "url": "assets/js/4.a5a7c60a.js",
    "revision": "418a719adeec5ef8c935ecc867c81fe1"
  },
  {
    "url": "assets/js/5.fad64f3f.js",
    "revision": "6bd45a84b3c712195f68acff367c7318"
  },
  {
    "url": "assets/js/6.31fe9861.js",
    "revision": "9dbafc808a9ffced1d489c339dc7036f"
  },
  {
    "url": "assets/js/7.95c84aa1.js",
    "revision": "c0e50f8b2d43929708b04354dfd5dd78"
  },
  {
    "url": "assets/js/8.a1858f5f.js",
    "revision": "afb6356a4c9dd3e8d6525261e5a49293"
  },
  {
    "url": "assets/js/9.141ee710.js",
    "revision": "07c6f6b36587b00d1d0117f858ef6b15"
  },
  {
    "url": "assets/js/app.44ec7854.js",
    "revision": "c57f97734aa5a4d1bd7a6d3755842546"
  },
  {
    "url": "gomoku.html",
    "revision": "231534fe3cfd3844f835beaadaefd96b"
  },
  {
    "url": "index.html",
    "revision": "0b7b5199d883935c709c67feb90025b2"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
