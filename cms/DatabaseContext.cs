using MongoDB.Driver;
using System.Collections.Generic;

namespace cms
{
    public static class DatabaseContext
    {
        static string _Host = "93.160.108.34";
        static string _Databate = "cms";

        static IMongoDatabase _Db = new MongoClient("mongodb://" + _Host).GetDatabase(_Databate);

        public static IMongoCollection<Page> Pages = _Db.GetCollection<Page>("pages");
        public static IMongoCollection<Component> Components = _Db.GetCollection<Component>("components");
    }
}