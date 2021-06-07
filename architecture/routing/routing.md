Refactor pages resolver into generic discovery mechanism driven by plugin.

routing?

routing - has route plugin?

I don't really like using terminoly that conflicts with the base platform.

Perhaps there is better terminolgy to use here :/

dynamic routing - to long - blah

x (core)
- x plugin manager

y ()
- integration w/ routing

plugin x
- load
- match

if not loaded load else match

When unmatched route requested load all plugins in parallel
- when ALL complete redirect

route rules?
- angular match process extended with rules

rules can use global contexts
- user info
-- perms, etc.

alias????? - module better

- create aliases
-- aliases load as routes
----- 

I kind of like that...

-----

alias module

These are all aliases to other components, right? - dynamic

alias builds dynamic matchers that decorate supplied matchers.
-- decoration includes adding rule matching via contexts.
--- ex. support matching route based on auth perms.

plugin - includes matcher? - plugin has matcher func -- matcher func can implement matching strategy any way it wants

- provides page context instead of panels - right? - that would make sense.


pages
- x -> register implementation of x plugin