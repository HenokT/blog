---
title: An Introduction to Android Jetpack Compose
publish_date: 2022-06-10
---

[Jetpack Compose](https://developer.android.com/jetpack/compose) is a fairly new UI toolkit for Android that is declarative and represents a departure from the legacy view-based imperative library. It's an adaptation of UI development concepts first made popular by the web UI library [React](https://reactjs.org/). If you are already familiar with React, you will have an easier time learning Compose. However, in this article, I don't assume the reader has prior knowledge of any declarative UI frameworks.

## Basics

Compose is a fundamental rethinking of how Android UI is authored. As such many of the concepts that we used to associate with Android UI development such as XML layout files, view/data binding, list adapters, and the use of imperative APIs to interact with views are no longer a thing. With Compose, all of your UI layout and logic is written as Kotlin functions annotated with the [@Composable](https://developer.android.com/reference/kotlin/androidx/compose/runtime/Composable) annotation. This means you have the full power of the Kotlin language at your fingertips to write composable functions that emit different UI trees based on their arguments and local state variables.

Let's look at a composable function that emits different post headers based on the type of post it's given as a parameter:

```kotlin
@Composable
private fun PostHeader(post: Post) {
    Column(
        Modifier.padding(horizontal = 10.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = post.title,
            style = MaterialTheme.typography.h6,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        if (post.postType == PostType.Promoted) {
            Text(
                text = "Promoted Post",
                style = MaterialTheme.typography.subtitle1,
            )
        } else {
            Text(
                text = "Shared by ${post.author}",
                style = MaterialTheme.typography.subtitle2,
            )
        }
    }
}
```

[Column](https://developer.android.com/reference/kotlin/androidx/compose/foundation/layout/package-summary#Column(androidx.compose.ui.Modifier,androidx.compose.foundation.layout.Arrangement.Vertical,androidx.compose.ui.Alignment.Horizontal,kotlin.Function1)) is a layout composable function from the foundation package that places its children in a vertical sequence. It's analogous to using the `<LinearLayout android:orientation="vertical"/>` tag in the legacy layout system and is part of a layout system that includes two other common layout composables: [Row](https://developer.android.com/reference/kotlin/androidx/compose/foundation/layout/package-summary#Row(androidx.compose.ui.Modifier,androidx.compose.foundation.layout.Arrangement.Horizontal,androidx.compose.ui.Alignment.Vertical,kotlin.Function1)) and [Box](https://developer.android.com/reference/kotlin/androidx/compose/foundation/layout/package-summary#Box(androidx.compose.ui.Modifier)), which are analogous to `<LinearLayout android:orientation="horizontal"/>` and `<FrameLayout/>` respectively.

[Text](https://developer.android.com/reference/kotlin/androidx/compose/material/package-summary#Text(kotlin.String,androidx.compose.ui.Modifier,androidx.compose.ui.graphics.Color,androidx.compose.ui.unit.TextUnit,androidx.compose.ui.text.font.FontStyle,androidx.compose.ui.text.font.FontWeight,androidx.compose.ui.text.font.FontFamily,androidx.compose.ui.unit.TextUnit,androidx.compose.ui.text.style.TextDecoration,androidx.compose.ui.text.style.TextAlign,androidx.compose.ui.unit.TextUnit,androidx.compose.ui.text.style.TextOverflow,kotlin.Boolean,kotlin.Int,kotlin.Function1,androidx.compose.ui.text.TextStyle)) is another composable function from the material package that displays text using a given style, font size, color, etc.

The basic idea is simple. You describe your UI tree based on the data passed to your composable functions as arguments and local state variables. When the arguments or local state variables change, Compose re-executes your composable with the new data in a process called recomposition and a new UI tree is emitted.

One way to trigger a recomposition is by updating a state observed by your composables. Let's look at a `PostCard` composable function that wraps the `PostHeader` composable from above and reacts to post title clicks by toggling the visibility of the post content based on a state variable.

```kotlin
@Composable
private fun PostCard(
    post: Post,
    modifier: Modifier = Modifier
) {

    var isExpanded by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        PostHeader(
            post,
            onTitleClick = {
                isExpanded = !isExpanded
            },
            isExpanded = isExpanded
        )
        if (isExpanded) {
            Text(
                text = post.content,
                style = MaterialTheme.typography.body1,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

    }
}

@Composable
private fun PostHeader(
    post: Post,
    onTitleClick: () -> Unit = {}
    isExpanded: Boolean,
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 10.dp)
            .let {
                if (isExpanded) it.border(width = 1.dp, color = Color.Red) else it
            },
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = post.title,
            style = MaterialTheme.typography.h6,
            modifier = Modifier
                .padding(bottom = 8.dp)
                .clickable { onTitleClick() },
        )
        /*...*/
    }
}
```

The first thing you will notice is that we are declaring a state variable `isExpanded` using this syntax:

```kotlin
var isExpanded by remember { mutableStateOf(false) }
```

There is a lot to unpack here so let's go through it one by one:

- [`mutableStateOf`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/package-summary#mutableStateOf(kotlin.Any,androidx.compose.runtime.SnapshotMutationPolicy)) returns a [`MutableState`](https://developer.android.com/jetpack/compose/state#state-in-composables) object initialized with the passed in value. A `MutableState` object is a single value holder whose reads and writes are observed by the Compose runtime. When the value is changed, it triggers a recomposition of the composables that read from it and any composables that they call.

- [`remember`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/package-summary#remember(kotlin.Function0)) is a Compose specific function that ensures that the value returned by its lambda parameter is remembered across recompositions. Without it, our state object will be reinitialized on every recomposition.

- `by` is a kotlin keyword for declaring a [delegated property](https://kotlinlang.org/docs/delegated-properties.html#local-delegated-properties) - syntactic sugar that lets us read and write a value stored in an object (returned by the right side) as if it's a local variable. 

To react to the post title click, we are passing in an event handler callback to the `PostHeader` composable which in turn forwards it to the `Text` composable that displays the title. Inside the callback, we update the value of `isExpanded` state, which triggers a recomposition of the `PostCard` and `PostHeader` composables and causes a new UI tree to be emitted.

# Integration with Activity and Fragment lifecycle

In a 100% Compose application, you typically will have one activity as an entry point where the root of the compose UI tree is set as the content of the activity in an `onCreate` lifecycle callback as follows. You can then nest other composables under the root of the UI tree (`MyApp`) to describe the UI for the entire app.

```kotlin
class MainActivity : AppCompatActivity(){  
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApp()
        }
    }
}

@Composable
fun MyApp() {
    var currentRoute by remember {
        mutableStateOf(NavRoutes.POST_FEED)
    }

    when (currentRoute) {
        NavRoutes.POST_FEED -> {
            val postFeedViewModel = viewModel<PostFeedViewModel>()
            PostFeed(
                postFeedViewModel = postFeedViewModel,
                navigateTo = {
                    currentRoute = it
                }
            )
        }
        NavRoutes.SETTINGS -> {
            val settingsViewModel = viewModel<SettingsViewModel>()
            UserSettings(settingsViewModel = settingsViewModel,
                navigateTo = {
                    currentRoute = it
                }
            )
        }
    }
}

object NavRoutes {
    const val POST_FEED = "post-feed"
    const val SETTINGS = "settings"
}


@Composable
fun PostFeed(postFeedViewModel: PostFeedViewModel, navigateTo: (route: String) -> Unit) {
    val posts by postFeedViewModel.posts.collectAsState()
    LazyColumn {
        items(items = posts) { post ->
            PostCard(post = post)
        }
    }
}

@Composable
fun UserSettings(settingsViewModel: SettingsViewModel, navigateTo: (route: String) -> Unit) {
     /*...*/
}
```

The navigation scheme we are using above is straightforward and works for simple apps but Compose also provides deep integration with Jetpack [Navigation](https://developer.android.com/jetpack/compose/navigation) that can be employed for complex apps.

The example also demonstrates how we can obtain an instance of a [ViewModel](https://developer.android.com/reference/kotlin/androidx/lifecycle/ViewModel) that's scoped to the lifecycle of the activity by using the built-in [`viewModel<T : ViewModel>()`](https://developer.android.com/reference/kotlin/androidx/lifecycle/viewmodel/compose/package-summary#viewModel(androidx.lifecycle.ViewModelStoreOwner,kotlin.String,androidx.lifecycle.ViewModelProvider.Factory)) function.

You can also progressively adopt Compose by implementing some parts of your UI with it. We don't go into that here but the official guide has a [section](https://developer.android.com/jetpack/compose/interop/adding) dedicated to this use case.


## Modifiers

[Modifiers](https://developer.android.com/reference/kotlin/androidx/compose/ui/Modifier) in compose allow you to decorate a composable and affect its size, layout, appearance, interactivity, etc.

In the following example, we use modifiers to specify the layout constraints for the `Column` layout and set a background and padding for its contents. We also use modifiers to specify the aspect ratio of the `Image` composable and make it clickable by passing a click event handler lambda.

```kotlin
@Composable
fun PostCard(post: Post, onImageClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(color = Color.Gray)
            .padding(vertical = 8.dp, horizontal = 12.dp)
    ) {
        Image(
            painter = rememberImagePainter(post.image.url),
            contentDescription = "",
            modifier = Modifier
                .aspectRatio(16/9f)
                .clickable { onImageClick() }
        )
        Text(/*...*/)
    }
}
```

Modifiers are also type-safe, in that you will only have access to modifiers that are allowed in the scope the composable you are modifying is in. For example, you can use the `weight` modifier to have composables with flexible sizes inside a `Row` or `Column` layout. However, the `weight` modifier is not available within a `Box` layout.

One thing to be mindful about when using modifiers is that the order in which they are applied matters. Consider the following example of a custom button implemented with a `Text` composable centered within a `Box` layout.

```kotlin
@Composable
private fun CustomButton(text: String){
    Box(
        modifier = Modifier
            .padding(5.dp)
            .background(Color.Red)
            .clickable { /*...*/ }
    ) {
       Text(text = text, modifier = Modifier.align(Alignment.Center))
    }
}
```

The `padding` modifier is applied to the `Box` composable before the `background` and `clickable` modifiers. This means the background color won't be applied to the padding area and the clickable surface won't include the padding.

On the other hand, if we apply the `padding` modifier after the `background` and `clickable` modifiers, as shown below, both modifiers apply to the padding area.

```kotlin
@Composable
private fun CustomButton(text: String){
    Box(
        modifier = Modifier
            .background(Color.Red)
            .clickable { /*...*/ }
            .padding(5.dp)
    ) {
       Text(text = text, modifier = Modifier.align(Alignment.Center))
    }
}
```

You can also apply the same modifier multiple times. Below, we are applying the `padding` and `background` modifiers twice to give the button surface a layered appearance.

```kotlin
@Composable
private fun FancyButton(text: String){
    Box(
        modifier = Modifier
            .clickable { /*...*/ }
            .background(Color.Red)
            .padding(5.dp)
            .background(Color.Yellow)
            .padding(5.dp)
    ) {
        Text(text = text, modifier = Modifier.align(Alignment.Center))
    }
}
```


## CompositionLocal

In Compose, you will have values that are frequently and widely used in your composables and passing those values as arguments to all composables that rely on them isn't practical. Examples of these types of values are the context object and theming values like color and typography styles. Compose addresses this concern by providing a way to pass data down the composition tree implicitly via what's called [CompositionLocal](https://developer.android.com/jetpack/compose/compositionlocal). And if you are familiar with React, it's analogous to [`React.Context`](https://reactjs.org/docs/context.html).

You can find the use of this feature in the built-in `stringResource` composable function that loads string resources by resource id.

```kotlin
@Composable
fun stringResource(@StringRes  id: Int): String {
    // simplified for clarity
    val context = LocalContext.current
    return context.resources.getString(id)
}
```

As you can see above, the `context` object is obtained by simply accessing the `current` property of a top-level property object `LocalContext` of type `CompositionLocal`.

You can think of a CompositionLocal instance as a key to a value in an internally managed map. When you access its `current` property, it returns a value associated with it somewhere higher up in the composition tree. This becomes clearer when you want to provide your own values via `CompositionLocal`. Here is an example in which we initialize and provide a `GoogleSignInClient` instance that is needed by composables throughout our app.

We first declare a `CompositionLocal<GoogleSignInClient?>` instance as a top-level property associated with a default value of `null`:

`val LocalGoogleSignInClient = staticCompositionLocalOf<GoogleSignInClient?> { null }`

Then, inside the root of our Compose tree (`MyApp`), we initialize a `GoogleSignInClient` instance and wrap the contents of the app with the `CompositionLocalProvider` composable while providing the mapping of the `LocalGoogleSignInClient` CompositionLocal to the initialized client as its argument:

```kotlin
@Composable
fun MyApp() {

    val context = LocalContext.current
    
    val gso = GoogleSignInOptions
        .Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(context.getString(R.string.google_sign_in_server_client_id))
        .requestEmail()
        .requestId()
        .build()
    
    val googleSignInClient = GoogleSignIn.getClient(context, gso)

    CompositionLocalProvider(
        LocalGoogleSignInClient provides googleSignInClient
    ){
        var currentRoute by remember {
            mutableStateOf(NavRoutes.POST_FEED)
        }

        when (currentRoute) {
            NavRoutes.POST_FEED -> {
                /*...*/
            }
            NavRoutes.SETTINGS -> {
                val settingsViewModel = viewModel<SettingsViewModel>()
                UserSettings(settingsViewModel = settingsViewModel,
                    navigateTo = {
                        currentRoute = it
                    }
                )
            }
        }
    }
}
```

Now, any composable in our app that needs to access the initialized `GoogleSignInClient` can do so as follows:

```kotlin
@Composable
fun UserSettings(settingsViewModel: SettingsViewModel, navigateTo: (route: String) -> Unit) {
    val googleSignInClient = LocalGoogleSignInClient.current
    /*...*/
}
```

Keep in mind that CompositionLocal is a powerful feature but it has the potential to make your composables context-dependent and less testable. It's only intended to be used when it is not practical to pass values to composables via arguments.

## Side Effects
Although composables, in general, should be side-effect free, there are cases that require us to launch side-effects from composables. Below is an example where we launch an effect to increment the view count of the PostFeed when it enters composition.

```kotlin
@Composable
fun PostFeed(postFeedViewModel: PostFeedViewModel, navigateTo: (route: String) -> Unit) {
    LaunchedEffect(postFeedViewModel) {
        // this block is executed in a coroutine scope and 
        // can call suspend functions that make API/db calls,  
        // provided that those suspend functions are implemented 
        // to run with a dispatcher other than Dispatchers.Main
        postFeedViewModel.incrementViews()
    }
    /*...*/
}
```

There are other ways to launch a side effect depending on your requirements and are documented in detail in the [side-effect](https://developer.android.com/jetpack/compose/side-effects) section of the official guide.


## Preview
Previews are one of my favorite features of Compose; they allow you to preview your composables with different arguments and system configurations during development from within Android Studio. As an example, if you have the following previews of the `PostCard` composable from above defined in Android Studio, when you switch to the design view of the file containing those previews, you will see two instances of the composable rendered - one in light mode (default) and one in dark mode.

```kotlin
@Preview("PostCard (light)")
@Preview("PostCard (dark)", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
fun PreviewPostCard() {
    MaterialTheme {
        PostCard(
            post = samplePosts[0],
            onImageClick = {}
        )
    }
}
```

## Conclusion

In my opinion, Jetpack Compose is a game-changer in Android UI development. Implementation of UI layout and behavior that used to span multiple files and formats can now be expressed as a tree of composable functions where you have all of Kotlin at your disposal. And with previews, you can quickly iterate through the design of your composables until you get something you are happy with.

There are topics that I haven't covered such as Theming, Navigation, Lists, Animation, Gestures, etc but are covered in detail in the [official guide](https://developer.android.com/jetpack/compose/documentation).
