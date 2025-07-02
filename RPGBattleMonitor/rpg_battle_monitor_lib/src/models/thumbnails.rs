use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "thumbnails")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub dimensions: String,
    pub image_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assets::Entity",
        from = "Column::ImageId",
        to = "super::assets::Column::Id"
    )]
    Image,
}

impl Related<super::assets::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Image.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

