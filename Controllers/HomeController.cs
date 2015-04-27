using cms.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace cms.Controllers
{
    public class HomeController : Controller
    {
        static Site Site = new Site();

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<string> GetSite()
        {
            try
            {
                await Site.GetSite();

                Site.Pages = Site.Pages.Where(p => p.Visible).ToList();

                return JsonConvert.SerializeObject(Site);
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }

        [HttpGet]
        public string GetNewPages()
        {
            try
            {
                Site.Pages = Site.GetPages();

                return JsonConvert.SerializeObject(Site);
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }

        [HttpPost]
        public async Task<string> AddView(long startTime, string browser, string os, string ip, string language, string country, string city, string longitude, string latitude, string pageFk)
        {
            try
            {
                var view = new PageView();

                view.StartTime = new DateTime(1970, 1, 1).AddTicks(startTime * 10000);
                view.Browser = browser;
                view.OS = os;
                view.IP = ip;
                view.Language = language;
                view.Country = country;
                view.City = city;
                view.Longitude = longitude;
                view.Latitude = latitude;
                view.PageFk = ObjectId.Parse(pageFk);

                await DatabaseContext.Views.InsertOneAsync(view);

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }

        [HttpPost]
        public async Task<string> FinishView(long endTime, string viewId)
        {
            try
            {
                await DatabaseContext.Views.UpdateOneAsync(
                    v => v.Id == ObjectId.Parse(viewId),
                    Builders<PageView>.Update.Set(v => v.EndTime, new DateTime(1970, 1, 1).AddTicks(endTime * 10000)));

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
    }
}