import blog, { ga, redirects } from "https://deno.land/x/blog@0.3.3/blog.tsx";

blog({
  title: "Henok Tadesse",
  author: "Henok Tadesse",
  avatar: "avatar.jpg",
  avatarClass: "rounded-full",
  background: "#f9f9f9",
  links: [
    { title: "Email", url: "mailto:hegystyle@gmail.com" },
    { title: "Github", url: "https://github.com/HenokT" },
  ],

  // middlewares: [

  // If you want to set up Google Analytics, paste your GA key here.
  // ga("UA-XXXXXXXX-X"),

  // If you want to provide some redirections, you can specify them here,
  // pathname specified in a key will redirect to pathname in the value.
  // redirects({
  //  "/hello_world.html": "/hello_world",
  // }),

  // ]
});
