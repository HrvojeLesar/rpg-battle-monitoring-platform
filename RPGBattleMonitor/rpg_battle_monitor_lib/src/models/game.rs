use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "game")]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub system: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

mod inner {}
