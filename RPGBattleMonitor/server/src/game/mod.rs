use std::borrow::Borrow;

use mlua::{FromLua, Lua, UserData};

#[derive(Debug, Clone)]
pub struct Game {
    pub lua: Lua,
    test: i32,
}

impl Default for Game {
    fn default() -> Self {
        let lua = Lua::new();

        Self { lua, test: 123 }
    }
}

impl UserData for Game {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method_mut("inc", |_lua, game, ()| {
            game.test += 1;
            Ok(())
        });

        methods.add_method_mut("dec", |_lua, game, ()| {
            game.test -= 1;
            Ok(())
        });

        methods.add_method("read", |_lua, game, ()| Ok(game.test));
    }
}
