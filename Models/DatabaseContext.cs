using MongoDB.Driver;

namespace cms.Models
{
    public static class DatabaseContext
    {
        static string _Host = "93.160.108.34";
        static string _Databate = "cms";

        static IMongoDatabase _Db = new MongoClient("mongodb://" + _Host).GetDatabase(_Databate);

        public static IMongoCollection<Site> Site = _Db.GetCollection<Site>("site");
        public static IMongoCollection<Page> Pages = _Db.GetCollection<Page>("pages");
        public static IMongoCollection<Component> Components = _Db.GetCollection<Component>("components");
    }
}