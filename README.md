# akun-spam-ward

Automated detection and rejection of the undesirables

## How to use

Download the zip from [here](https://github.com/Fiddlekins/akun-spam-ward/releases/latest) and extract it anywhere.

### First you need to configure two files:

`credentials.json` needs to have the username and password of the account you wish to run this tool with.

This typically means your primary account, since the account requires sufficient privileges to ban and delete chat posts
within your target story.

This does mean storing your credentials in plaintext on your local disk, so be wary of who has access to the machine.

`wardedStories.json` needs to list the IDs of the stories you wish to protect.

The story ID can be derived from the story's URL.

For this example story URL:

 ```
 https://fiction.live/stories/Depravity/ya9v6ZAGRYNnoT9ay/Chapter-7-The-Chapter-With-Horse-Cocks/EvqrzX67ry8KaTdpu
 ```

the story ID is

 ```
 ya9v6ZAGRYNnoT9ay
 ```

Using that information, you would make the contents of `wardedStories.json` look like

```
[
    "ya9v6ZAGRYNnoT9ay"
]
```

### Configuring spam patterns

All files within the `spam` folder will be used as a pattern to match against.

A post will match the spam pattern if the entire text of a spam pattern file can be found within the post message.

(whitespace must also match exactly, eg. linebreaks and spaces)

For example:
We have `test.txt` sitting within the `spam` folder, which has file contents:

```
test pattern
```

The following posts will match it:

```
test pattern
```

(perfect match)

```
Does this mesage contain the test pattern?
```

(extra text before or after does not stop the match from being made)

```
On no!
 test pattern
Argh!
``` 

(likewise linebreaks before and after make no difference)

The following posts will not match it:

```
Does this mesage contain the testing pattern?
```

(`testing pattern` is not the same as `test pattern`)

```
test  pattern
```

(there's an extra space between `test` and `pattern` so it doesn't match)

```
test 
pattern
```

(there's a linebreak between `test` and `pattern` so it doesn't match)

#### Regular Expressions (regex)

If you're technically proficient, you can specify a pattern to be used as regex instead of plaintext matching by making
a text file with the extension `.regex`

eg. `/spam/test.regex`

A handy tool to play with this can be found [here](https://regexr.com/).

### Running the tool:

There are three command files to start the tool:

- `run.cmd` will start it, with logging showing up in the console
- `run-log.cmd` will start it, with logging being funnelled to `ward.log` - handy if you want to make sure a record of
  what posts have been detected and removed will remain after stopping the tool
- `run-dry.cmd` will start it, but posts detected as spam will not be banned or deleted - this can be used to confirm
  that spam patterns are behaving as intended

### When mistakes happen:

Which they inevitably do. A misconfiguration or unlucky poster, a ban issued that was not desired, etc

Simply head to the story's ban list by clicking on the "BANS" item in the hover-over drop down MENU. Here you can see a
list of users that are banned, and links to the posts that they were banned for. There are likewise buttons beside these
that allow you to unban them.
