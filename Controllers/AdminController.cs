using System.Web.Mvc;
using cms.Models;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MongoDB.Driver;
using MongoDB.Bson;

namespace cms.Controllers
{
    public class AdminController : Controller
    {
        static Site _Site = new Site();

        [HttpGet]
        public async Task<string> Site()
        {
            try
            {
                _Site.GetSite();

                var json = JsonConvert.SerializeObject(_Site);

                return json;
            }
            catch (MongoDB.Driver.MongoException ex)
            {
                return JsonConvert.SerializeObject(ex.Message);
            }
        }

        [HttpGet]
        public async Task<string> Auth()
        {
            try
            {
                await _Site.GetSite();

                if (_Site.ProjectName == null)
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
        public async Task<string> InitProject(string name)
        {
            await _Site.NewSite(name);

            return "true";
        }

        [HttpPost]
        public async Task<string> AddPage(string name, int? order)
        {
            try
            {
                var page = DatabaseContext.Pages.Find(Builders<Page>.Filter.Eq(p => p.Name, name)).SingleOrDefaultAsync();

                if (page == null)
                {
                    Page.AddPage(name, (int)order);

                    return "true";
                }
                else
                {
                    return "false";
                }
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }

        [HttpPost]
        public async Task<string> DeletePage(string id)
        {
            try
            {
                var Id = ObjectId.Parse(id);
                Page.DeletePage(Id);

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
    }
}