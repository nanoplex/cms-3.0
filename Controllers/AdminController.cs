using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using cms.Models;
using MongoDB.Driver;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace cms.Controllers
{
    public class AdminController : Controller
    {
        static Site _Site { get; set; }

        [HttpGet]
        public async Task<JsonResult> Site()
        {
            try
            {
                _Site = await cms.Models.DatabaseContext.Site.Find(s => true).FirstOrDefaultAsync();

                return Json(_Site, JsonRequestBehavior.AllowGet);
            }
            catch (MongoDB.Driver.MongoException ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public async Task<string> Auth()
        {
            try
            {
                var site = await DatabaseContext.Site.Find(new BsonDocument()).ToListAsync();

                if (site.Count == 0)
                    return "new";
                else
                    return "true";
            }
            catch (MongoDB.Driver.MongoException ex)
            {
                return ex.Message;
            }
        }

        [HttpPost]
        public string InitProject(string name)
        {
            try
            {
                _Site.NewSite(name);

                return "true";
            }
            catch (MongoDB.Driver.MongoException ex)
            {
                return ex.Message;
            }
        }
    }
}