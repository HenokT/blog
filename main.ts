// import blog from "https://deno.land/x/blog/blog.tsx";
// using the latest version from github because the fix for custom pathnames (https://github.com/denoland/deno_blog/pull/130) is not yet released
import blog from "https://raw.githubusercontent.com/denoland/deno_blog/main/blog.tsx";

blog({
  author: "Henok Tadesse",
  title: "Henok Tadesse",
  description:
    "A personal blog where I share what I learn as a sofware developer.",
  avatar: "avatar.jpg",
  avatarClass: "rounded-full",
  links: [
    { title: "Email", url: "mailto:hegystyle@gmail.com" },
    { title: "Github", url: "https://github.com/HenokT" },
  ],
  readtime: true,
  middlewares: [
    // If you want to set up Google Analytics, paste your GA key here.
    // ga("G-NRTE0H7K94"),
    // If you want to provide some redirections, you can specify them here,
    // pathname specified in a key will redirect to pathname in the value.
    // redirects({
    //  "/hello_world.html": "/hello_world",
    // }),
  ],
});
