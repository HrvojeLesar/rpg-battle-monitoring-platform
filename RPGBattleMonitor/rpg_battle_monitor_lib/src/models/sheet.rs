use sea_orm::entity::prelude::*;
use serde::Serialize;

pub use inner::*;

#[cfg(feature = "api_doc")]
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "sheet")]
#[cfg_attr(feature = "api_doc", derive(ToSchema))]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub version: i32,
    pub attributes: serde_json::Value,
    pub hash: String,
    pub config: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(belongs_to = "Entity", from = "Column::Config", to = "Column::Id")]
    SelfReferencing,
}

pub struct SelfReferencingLink;

impl Linked for SelfReferencingLink {
    type FromEntity = Entity;

    type ToEntity = Entity;

    fn link(&self) -> Vec<RelationDef> {
        vec![Relation::SelfReferencing.def()]
    }
}

impl ActiveModelBehavior for ActiveModel {}

mod inner {
    use sea_orm::{ActiveValue::Set, ColumnTrait, ConnectionTrait, EntityTrait, QueryFilter};

    use crate::{
        cdn::filesystem::sha256_hash,
        models::sheet::{ActiveModel, Column, Entity, Model},
    };

    // TODO: Add model errors
    use crate::cdn::error::{Error, Result};

    pub type Sheet = Model;

    pub struct SheetManager {}

    impl SheetManager {
        #[tracing::instrument(skip(self, conn))]
        pub async fn create_configuration(
            &self,
            conn: &impl ConnectionTrait,
            attributes: serde_json::Value,
        ) -> Sheet {
            let hash = sha256_hash(&attributes.to_string());

            if let Some(sheet) = self.get_by_hash(conn, &hash).await.unwrap() {
                return sheet;
            }

            let sheet_active_model = ActiveModel {
                attributes: Set(attributes),
                // version: todo!("set max version"),
                hash: Set(hash),
                ..Default::default()
            };

            unimplemented!();
        }

        #[tracing::instrument(skip(self, conn))]
        pub async fn get_by_hash(
            &self,
            conn: &impl ConnectionTrait,
            hash: &str,
        ) -> Result<Option<Sheet>> {
            Ok(Entity::find()
                .filter(Column::Hash.eq(hash))
                .one(conn)
                .await?)
        }
    }
}
