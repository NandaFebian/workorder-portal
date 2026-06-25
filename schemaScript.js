db.createCollection("Company", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Company",
      required: ["_id"],
      properties: {
        "_id": { bsonType: "objectId" },
        "name": { bsonType: "string" },
        "address": { bsonType: "string" },
        "description": { bsonType: "string" },
        "ownerId": { bsonType: "objectId" },
        "managers": { bsonType: "array", items: { bsonType: "undefined" } },
        "staffs": { bsonType: "array", items: { bsonType: "undefined" } },
        "isActive": { bsonType: "bool" },
        "isFaqActive": { bsonType: "bool" },
        "faqApiKey": { bsonType: "string" },
        "faqExternalCompanyId": { bsonType: "double" },
        "integrationConfig": { bsonType: "object", title: "integrationConfig", properties: { "externalLoginUrl": { bsonType: "string" }, "externalVerifyUrl": { bsonType: "string" }, "externalCheckMembershipsUrl": { bsonType: "string" }, "externalCheckStatusUrl": { bsonType: "string" }, "secretKey": { bsonType: "null" }, "isIntegrationActive": { bsonType: "bool" }, "integrationType": { bsonType: "string" }, }, },
        "deletedAt": { bsonType: "null" },
        "createdAt": { bsonType: "date" },
        "updatedAt": { bsonType: "date" },
        "__v": { bsonType: "double" },
      },
    },
  },
});

db.createCollection("Company", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Company",
      required: ["_id"],
      properties: {
        "_id": { bsonType: "objectId" },
        "name": { bsonType: "string" },
        "address": { bsonType: "string" },
        "description": { bsonType: "string" },
        "ownerId": { bsonType: "objectId" },
        "managers": { bsonType: "array", items: { bsonType: "undefined" } },
        "staffs": { bsonType: "array", items: { bsonType: "undefined" } },
        "isActive": { bsonType: "bool" },
        "isFaqActive": { bsonType: "bool" },
        "faqApiKey": { bsonType: "string" },
        "faqExternalCompanyId": { bsonType: "double" },
        "integrationConfig": { bsonType: "object", title: "integrationConfig", properties: { "externalLoginUrl": { bsonType: "string" }, "externalVerifyUrl": { bsonType: "string" }, "externalCheckMembershipsUrl": { bsonType: "string" }, "externalCheckStatusUrl": { bsonType: "string" }, "secretKey": { bsonType: "null" }, "isIntegrationActive": { bsonType: "bool" }, "integrationType": { bsonType: "string" }, }, },
        "deletedAt": { bsonType: "null" },
        "createdAt": { bsonType: "date" },
        "updatedAt": { bsonType: "date" },
        "__v": { bsonType: "double" },
      },
    },
  },
});